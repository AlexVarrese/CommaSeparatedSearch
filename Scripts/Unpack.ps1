$toolsPath = "$PSScriptRoot\..\Tools\CoreTools"
$solutionPath = "$PSScriptRoot\..\Solution"

. $PSScriptRoot\Util\GetConnection.ps1
$connection = GetConnection

. $PSScriptRoot\Util\GetLocalSolution.ps1
$solution = GetLocalSolution

Export-CrmSolution `
	-conn $connection `
	-SolutionName $solution.name `
	-SolutionZipFileName "$($solution.name).zip"
Export-CrmSolution `
	-conn $connection `
	-SolutionName $solution.name `
	-SolutionZipFileName "$($solution.name)_managed.zip" `
	-Managed

Start-Process "$toolsPath\SolutionPackager.exe" `
	-ArgumentList `
		"/action: Extract", `
		"/zipfile: $($solution.name).zip", `
		"/folder: $solutionPath", `
		"/packagetype: Both" `
	-Wait `
	-NoNewWindow

Remove-Item "$($solution.name).zip"
Remove-Item "$($solution.name)_managed.zip"