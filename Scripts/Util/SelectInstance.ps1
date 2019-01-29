$contextPath = "$PSScriptRoot\..\Context"

Function SelectInstance {
	param(
		[string]$domainName = $null,
		[string]$apiUrl = "https://admin.services.crm.dynamics.com"
	)

	. $PSScriptRoot\GetCredential.ps1
	$credential = GetCredential
	
	$instances = (Get-CrmInstances `
		-ApiUrl $apiUrl `
		-Credential $credential) `
		| Sort-Object -Property DomainName

	If([string]::IsNullOrEmpty($domainName)) {
		$instance = $null
		While($instance -eq $null) {
			$index = 0
			$instances | ForEach-Object -Process {
				Write-Host "($index) $($_.DomainName) - $($_.FriendlyName)"
				$index++
			}
			$input = Read-Host -prompt "Select an instance (Type the number or the domain name):"
			[int]$index = $null
			If([int32]::TryParse($input, [ref]$index)) {
				If($index -lt $instances.Count -And $index -ge 0) {
					$instance = $instances[$index]
				} Else {
					Write-Host "Index out of range. Please enter a number in the range [0, $($instances.Count - 1)]"
				}
			} Else {
				$instance = ($instances | Where { $_.DomainName -eq $input } | Select -First 1)
				If($instance -eq $null) {
					Write-Host "Could not find instance with domain name ""$domainName"""
				}
			}
		}
	} Else {
		$instance = ($instances | Where { $_.DomainName -eq $domainName } | Select -First 1)
	}

    If (-Not (Test-Path $contextPath)) {
        md $contextPath
    }

	$instance | Export-CliXml -Path "$contextPath/instance.xml"

	Return $instance
}