$urls = @(
  'http://localhost:3000/dashboard/clients/1/pets/1/records/new',
  'http://localhost:3000/dashboard/clients/1/pets/1/records/1/edit',
  'http://localhost:3000/dashboard/clients/1/pets/1/timeline'
)

foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -ErrorAction Stop
    Write-Output "$u -> $($r.StatusCode) (Length: $($r.RawContent.Length))"
  } catch {
    Write-Output "$u -> ERROR: $($_.Exception.Message)"
  }
}
