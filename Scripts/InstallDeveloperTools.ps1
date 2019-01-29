$toolsPath = "$PSScriptRoot\..\Tools"

$sourceNugetExe = "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe"
$targetNugetExe = "$toolsPath\nuget.exe"
Remove-Item $toolsPath -Force -Recurse -ErrorAction Ignore
md $toolsPath
Invoke-WebRequest $sourceNugetExe -OutFile $targetNugetExe
Set-Alias nuget $targetNugetExe -Scope Global -Verbose

##
##Download CoreTools
##
nuget install  Microsoft.CrmSdk.CoreTools -O $toolsPath
md "$toolsPath\CoreTools"
$coreToolsFolder = Get-ChildItem $toolsPath | Where-Object {$_.Name -match 'Microsoft.CrmSdk.CoreTools.'}
move "$toolsPath\$coreToolsFolder\content\bin\coretools\*.*" "$toolsPath\CoreTools"
Remove-Item "$toolsPath\$coreToolsFolder" -Force -Recurse

##
##Remove NuGet.exe
##
Remove-Item $targetNugetExe

Install-Module Microsoft.Xrm.Data.PowerShell -Scope CurrentUser