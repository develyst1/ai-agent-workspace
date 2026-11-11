# Prox standby watcher - run it as a BACKGROUND job, then end the turn.
#
# It blocks (one directory poll every few seconds, no model turns, no tokens) and
# exits the moment NEW work for Prox appears:
#   - a request addressed to this seat that was not there when it armed
#     (REQUEST-*-to-prox-*.md)
#   - a new root file whose name names both seats (atlas...prox / prox...atlas)
#   - a request Prox already sent gaining a non-empty "## Atlas's answer"
#     section that it did not have when the watcher armed
#
# A finished background job wakes this session (Harness notification), so the
# exit IS the wake. Everything that already existed at arm time is ignored, so
# re-arming never fires on old news.
# See PROX.md -> "How you are woken".
param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [int]$Interval = 10
)

if (-not (Test-Path $Root)) { throw "workspace root not found: $Root" }

function Get-Answered($path) {
    if (-not (Test-Path $path)) { return $false }
    $text = Get-Content -Path $path -Raw -ErrorAction SilentlyContinue
    if (-not $text) { return $false }
    return [bool]([regex]::IsMatch($text, "(?ms)^##\s*Atlas'?s answer[^\r\n]*[\r\n]+(?:\s*[\r\n])*(\S)"))
}

function Get-RequestNames {
    return @(Get-ChildItem -Path $Root -Filter 'REQUEST-*-to-prox-*.md' -File -ErrorAction SilentlyContinue |
        ForEach-Object { $_.Name })
}

# Baseline: whatever is already true now is not news.
$known = @{}
foreach ($name in Get-RequestNames) { $known[$name] = $true }
foreach ($file in Get-ChildItem -Path $Root -Filter '*.md' -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '(?i)^REQUEST-.*(atlas.*prox|prox.*atlas)' }) {
    $known['BOTH:' + $file.Name] = $true
}
foreach ($file in Get-ChildItem -Path $Root -Filter 'REQUEST-prox-to-atlas-*.md' -File -ErrorAction SilentlyContinue) {
    $known['ANSWER:' + $file.Name] = (Get-Answered $file.FullName)
}

while ($true) {
    Start-Sleep -Seconds $Interval

    # 1. a request addressed to Prox that is new since arming
    $now = Get-RequestNames
    $fresh = @($now | Where-Object { -not $known.ContainsKey($_) })
    if ($fresh.Count -gt 0) {
        foreach ($name in $fresh) { $known[$name] = $true }
        Write-Output ("WAKE: new request - " + ($fresh -join ', '))
        exit 0
    }

    # 2. a new file naming both seats
    $both = @(Get-ChildItem -Path $Root -Filter '*.md' -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '(?i)^REQUEST-.*(atlas.*prox|prox.*atlas)' })
    $freshBoth = @($both | Where-Object { -not $known.ContainsKey('BOTH:' + $_.Name) })
    if ($freshBoth.Count -gt 0) {
        foreach ($file in $freshBoth) { $known['BOTH:' + $file.Name] = $true }
        Write-Output ("WAKE: new seat-to-seat file - " + (($freshBoth | ForEach-Object { $_.Name }) -join ', '))
        exit 0
    }

    # 3. Atlas answered a request Prox sent
    foreach ($file in Get-ChildItem -Path $Root -Filter 'REQUEST-prox-to-atlas-*.md' -File -ErrorAction SilentlyContinue) {
        $key = 'ANSWER:' + $file.Name
        $answered = Get-Answered $file.FullName
        if (-not $known.ContainsKey($key)) { $known[$key] = $answered; continue }
        if ($answered -and -not $known[$key]) {
            $known[$key] = $true
            Write-Output ("WAKE: Atlas answered - " + $file.Name)
            exit 0
        }
        $known[$key] = $answered
    }
}
