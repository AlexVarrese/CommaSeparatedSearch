$contextPath = "$PSScriptRoot\..\..\Context"

$instancePath = "$contextPath/instance.xml"

Function GetInstance {
	param(
		[string]$domainName = $null,
		[string]$apiUrl = "https://admin.services.crm.dynamics.com"
	)

	If(Test-Path $instancePath) {
        $instance = Import-CliXml -Path $instancePath
	} Else {
		. $PSScriptRoot\SelectInstance.ps1
		$instance = SelectInstance `
			-domainName $domainName `
			-apiUrl $apiUrl
	}
	Return $instance
}