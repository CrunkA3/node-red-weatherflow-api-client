function Get-ScriptDirectory {
    Split-Path -Parent $PSCommandPath
}
  
$sourcePath = Get-ScriptDirectory
Write-Output($sourcePath)

Write-Output("_______________________")

Set-Location "$($env:UserProfile)\.node-red"

npm install $sourcePath
Start-Process http://127.0.0.1:1880/
node-red