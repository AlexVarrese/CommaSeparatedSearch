Function GetLocalSolution
{
	$solution = (Get-Content -Raw -Path .\solution.json | ConvertFrom-Json)
	Return $solution
}