param(
	[switch]$Managed
)

$toolsPath = "$PSScriptRoot\..\Tools\CoreTools"
$solutionPath = "$PSScriptRoot\..\Solution"

. $PSScriptRoot\Util\GetLocalSolution.ps1
$solution = GetLocalSolution

Start-Process "$toolsPath\SolutionPackager.exe" `
	-ArgumentList `
		"/action: Pack", `
		"/zipfile: .\$($solution.name).zip", `
		"/folder: $solutionPath", `
		"/packagetype: $(If ($Managed.IsPresent) { "Managed" } Else { "Unmanaged" })", `
		"/map: $PSScriptRoot\..\map.xml" `
	-Wait `
	-NoNewWindow

. $PSScriptRoot\Util\GetConnection.ps1
$connection = GetConnection

Import-CrmSolutionAsync `
	-conn $connection `
	-SolutionFilePath ".\$($solution.name).zip" `
	-PublishChanges:$true `
	-BlockUntilImportComplete:$true `
	-MaxWaitTimeInSeconds -1

Remove-Item ".\$($solution.name).zip"