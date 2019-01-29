$contextPath = "$PSScriptRoot\..\..\Context"

$credentialPath = "$contextPath/credential.xml"

Function GetCredential {
    If (-Not (Test-Path $contextPath)) {
        md $contextPath
    }

    If (Test-Path $credentialPath) {
        $credential = Import-CliXml -Path $credentialPath
        $credential | Export-CliXml -Path $credentialPath
    } Else {
        $credential = Get-Credential
        $credential | Export-CliXml -Path $credentialPath
    }
    Return $credential
}