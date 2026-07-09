param(
  [switch]$OpenAfter
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root 'data'
if (-not (Test-Path -LiteralPath $DataDir)) {
  New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

$Quotes = @(
  @{ company = 'Singtel'; symbol = 'Z74.SI'; encoded = 'Z74.SI'; market = 'SGX'; indexLabel = 'STI'; indexSymbol = '^STI'; indexEncoded = '%5ESTI' },
  @{ company = 'Bharti Airtel'; symbol = 'BHARTIARTL.NS'; encoded = 'BHARTIARTL.NS'; market = 'NSE'; indexLabel = 'Nifty 50'; indexSymbol = '^NSEI'; indexEncoded = '%5ENSEI' },
  @{ company = 'AIS'; symbol = 'ADVANC.BK'; encoded = 'ADVANC.BK'; market = 'SET'; indexLabel = 'SET Index'; indexSymbol = '^SET.BK'; indexEncoded = '%5ESET.BK' },
  @{ company = 'Globe Telecom'; symbol = 'GLO.PS'; encoded = 'GLO.PS'; market = 'PSE'; indexLabel = 'PSEi'; indexSymbol = 'PSEI.PS'; indexEncoded = 'PSEI.PS' },
  @{ company = 'Telkom Indonesia'; symbol = 'TLKM.JK'; encoded = 'TLKM.JK'; market = 'IDX'; indexLabel = 'JCI'; indexSymbol = '^JKSE'; indexEncoded = '%5EJKSE' },
  @{ company = 'Optus parent'; symbol = 'Z74.SI'; encoded = 'Z74.SI'; market = 'SGX'; indexLabel = 'ASX 200'; indexSymbol = '^AXJO'; indexEncoded = '%5EAXJO' }
)

function Get-YahooQuote {
  param(
    [string]$Symbol,
    [string]$EncodedSymbol
  )

  $url = "https://query1.finance.yahoo.com/v8/finance/chart/$EncodedSymbol`?range=1d&interval=1m"
  $raw = & curl.exe -L -s --max-time 10 -A 'Mozilla/5.0 IthacaGroupMarketPulse/1.0' $url
  if (-not $raw) { return $null }

  $data = $raw | ConvertFrom-Json
  $meta = $data.chart.result[0].meta
  if (-not $meta) { return $null }

  $price = $meta.regularMarketPrice
  if ($null -eq $price) { $price = $meta.previousClose }
  $previousClose = $meta.previousClose
  $change = $null
  $changePercent = $null
  if ($null -ne $price -and $null -ne $previousClose -and $previousClose -ne 0) {
    $change = $price - $previousClose
    $changePercent = ($change / $previousClose) * 100
  }

  return @{
    symbol = $Symbol
    price = $price
    previousClose = $previousClose
    change = $change
    changePercent = $changePercent
    currency = $meta.currency
    exchange = $meta.exchangeName
    asOf = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssK')
  }
}

$items = @()
foreach ($item in $Quotes) {
  $quote = $null
  $index = $null
  try { $quote = Get-YahooQuote $item.symbol $item.encoded } catch {}
  try { $index = Get-YahooQuote $item.indexSymbol $item.indexEncoded } catch {}

  $items += @{
    company = $item.company
    symbol = $item.symbol
    market = $item.market
    indexLabel = $item.indexLabel
    indexSymbol = $item.indexSymbol
    quote = $quote
    index = $index
  }
}

$board = @{
  generatedAt = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssK')
  source = 'Yahoo Finance chart feed via local curl snapshot'
  items = $items
}

$json = $board | ConvertTo-Json -Depth 8
$jsonPath = Join-Path $DataDir 'market-snapshot.json'
$jsPath = Join-Path $DataDir 'market-snapshot.js'
Set-Content -LiteralPath $jsonPath -Value $json -Encoding UTF8
Set-Content -LiteralPath $jsPath -Value "window.MARKET_SNAPSHOT = $json;" -Encoding UTF8

$loaded = 0
foreach ($row in $items) {
  if ($row.quote -or $row.index) { $loaded += 1 }
}
Write-Host "Market snapshot refreshed: $loaded of $($items.Count) rows have quote or index data."
Write-Host "Wrote $jsonPath"
Write-Host "Wrote $jsPath"

if ($OpenAfter) {
  Start-Process (Join-Path $Root 'index.html')
}
