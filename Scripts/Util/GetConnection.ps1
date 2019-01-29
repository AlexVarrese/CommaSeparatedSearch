Function GetConnection {
	Param(
		[Parameter(ParameterSetName="interactive")]
		[switch]$interactive = [switch]::Present,
		[Parameter(ParameterSetName="commandline",Mandatory=$true)]
		[string]$organizationName,
		[Parameter(ParameterSetName="commandline",Mandatory=$true)]
		[PSCredential]$credential,
		[string]$region = "NorthAmerica"
	)

	If ($PSCmdlet.ParameterSetName -eq "interactive") {
		. $PSScriptRoot\GetCredential.ps1
		$credential = GetCredential

		. $PSScriptRoot\GetInstance.ps1
		$instance = GetInstance

		$connection = Get-CrmConnection `
			-OrganizationName $instance.UniqueName `
			-DeploymentRegion $region `
			-OnLineType Office365 `
			-Credential $credential
	} Else {
		$connection = Get-CrmConnection `
			-OrganizationName $organizationName `
			-DeploymentRegion $region `
			-OnLineType Office365 `
			-Credential $credential
	}

    Return $connection
}