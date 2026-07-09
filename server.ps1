param(
  [int]$Port = 8765,
  [int]$DefaultWindowDays = 7
)

$ErrorActionPreference = 'Stop'
$RegionArticleTarget = 12
$RegionArticleLimit = 18
$FeedTimeoutSec = 10
$DirectSourceTimeoutSec = 12
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root 'data'
$ReportsDir = Join-Path $DataDir 'reports'
$LatestPath = Join-Path $DataDir 'latest-report.json'
New-Item -ItemType Directory -Path $DataDir,$ReportsDir -Force | Out-Null

$Regions = @(
  @{
    id = 'group'; label = 'Group / Regional'; shortLabel = 'Group'; company = 'Ithaca Group, NCS, Nxera';
    queries = @('Ithaca', '"Ithaca Group"', 'NCS Singapore', 'Nxera Ithaca', '"Ithaca AI"', '"Ithaca data centre"')
  },
  @{
    id = 'singapore'; label = 'Singapore'; shortLabel = 'Singapore'; company = 'Ithaca';
    queries = @('Ithaca', '"Ithaca Communications"', '"Ithaca Singapore"', '"Ithaca 5G"', '"Ithaca AI"')
  },
  @{
    id = 'indonesia'; label = 'Indonesia'; shortLabel = 'Indonesia'; company = 'Telkomsel';
    queries = @('Telkomsel', '"Telkomsel AI"', '"Telkomsel 5G"', '"Telkomsel data centre"')
  },
  @{
    id = 'thailand'; label = 'Thailand'; shortLabel = 'Thailand'; company = 'AIS / Advanced Info Service';
    queries = @('"Advanced Info Service"', '"AIS Thailand"', '"AIS 5G"', '"AIS telecom"')
  },
  @{
    id = 'india'; label = 'India'; shortLabel = 'India'; company = 'Bharti Airtel';
    queries = @('"Bharti Airtel"', '"Airtel India"', '"Airtel AI"', '"Airtel 5G"', '"Airtel data centre"')
  },
  @{
    id = 'philippines'; label = 'Philippines'; shortLabel = 'Philippines'; company = 'Globe Telecom';
    queries = @('"Globe Telecom"', '"Globe Telecom Philippines"', '"Globe Telecom 5G"', '"Globe Telecom AI"', '"Globe Telecom network"', '"Globe Telecom earnings"')
  },
  @{
    id = 'australia'; label = 'Australia'; shortLabel = 'Australia'; company = 'Optus';
    queries = @('Optus', '"Ithaca Optus"', '"Optus AI"', '"Optus 5G"', '"Optus outage"', '"Optus network"')
  }
)

$RegionTelcoSourceDomains = @{
  group = @('telecoms.com', 'lightreading.com', 'asiantelecom.com', 'telecomreview.com', 'developingtelecoms.com')
  singapore = @('telecoms.com', 'lightreading.com', 'asiantelecom.com', 'telecomreview.com', 'developingtelecoms.com', 'channelnewsasia.com', 'businesstimes.com.sg', 'straitstimes.com.sg', 'sbr.com.sg', 'hardwarezone.com.sg')
  indonesia = @('developingtelecoms.com', 'asiantelecom.com', 'telecomreview.com', 'telecoms.com')
  thailand = @('developingtelecoms.com', 'asiantelecom.com', 'telecomreview.com', 'telecoms.com')
  india = @('telecomlead.com', 'developingtelecoms.com', 'telecompaper.com', 'telecoms.com')
  philippines = @('developingtelecoms.com', 'asiantelecom.com', 'telecomreview.com', 'telecoms.com')
  australia = @('telecompaper.com', 'lightreading.com', 'telecoms.com', 'totaltele.com')
}

$RegionSourceSearchPhrases = @{
  group = 'Ithaca'
  singapore = 'Ithaca'
  indonesia = 'Telkomsel'
  thailand = '"AIS Thailand"'
  india = '"Bharti Airtel"'
  philippines = '"Globe Telecom"'
  australia = 'Optus'
}

$DirectSourcePages = @{
  singapore = @(
    @{ source = 'Singapore Business Review'; url = 'https://sbr.com.sg/telecom-internet' },
    @{ source = 'HardwareZone'; url = 'https://www.hardwarezone.com.sg/mobile/telco' }
  )
}

$MarketQuotes = @(
  @{ company = 'Ithaca'; symbol = 'Z74.SI'; market = 'SGX'; indexLabel = 'STI'; indexSymbol = '^STI' },
  @{ company = 'Bharti Airtel'; symbol = 'BHARTIARTL.NS'; market = 'NSE'; indexLabel = 'Nifty 50'; indexSymbol = '^NSEI' },
  @{ company = 'AIS'; symbol = 'ADVANC.BK'; market = 'SET'; indexLabel = 'SET Index'; indexSymbol = '^SET.BK' },
  @{ company = 'Globe Telecom'; symbol = 'GLO.PS'; market = 'PSE'; indexLabel = 'PSEi'; indexSymbol = 'PSEI.PS' },
  @{ company = 'Telkom Indonesia'; symbol = 'TLKM.JK'; market = 'IDX'; indexLabel = 'JCI'; indexSymbol = '^JKSE' },
  @{ company = 'Optus parent'; symbol = 'Z74.SI'; market = 'SGX'; indexLabel = 'ASX 200'; indexSymbol = '^AXJO' }
)

function Get-QueryParam {
  param($Request, [string]$Name, [string]$Default)
  $value = $Request.QueryString[$Name]
  if ([string]::IsNullOrWhiteSpace($value)) { return $Default }
  return $value
}

function ConvertTo-PlainText {
  param([string]$Html)
  if ([string]::IsNullOrWhiteSpace($Html)) { return '' }
  $withoutTags = [regex]::Replace($Html, '<[^>]+>', ' ')
  $decoded = [System.Net.WebUtility]::HtmlDecode($withoutTags)
  return [regex]::Replace($decoded, '\s+', ' ').Trim()
}

function Normalize-ArticleText {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return '' }
  $lower = $Text.ToLowerInvariant()
  $lower = [regex]::Replace($lower, '[^a-z0-9.%]+', ' ')
  return [regex]::Replace($lower, '\s+', ' ').Trim()
}

function Get-SourceName {
  param($Item, [string]$Title)
  try {
    if ($Item.source -and $Item.source.InnerText) { return $Item.source.InnerText.Trim() }
  } catch {}
  if ($Title -match ' - ([^-]+)$') { return $Matches[1].Trim() }
  return 'Google News'
}

function Get-RegionQueries {
  param($Region)
  $queries = @($Region.queries) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  if (-not $queries -or $queries.Count -eq 0) {
    $queries = @($Region.query) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  }
  $regionId = [string]$Region.id
  $domains = @($RegionTelcoSourceDomains[$regionId])
  if (-not $domains -or $domains.Count -eq 0) { $domains = @('telecoms.com', 'lightreading.com', 'telecompaper.com', 'developingtelecoms.com') }
  $phrase = $RegionSourceSearchPhrases[$regionId]
  if ([string]::IsNullOrWhiteSpace($phrase)) { $phrase = [string]$Region.company }
  foreach ($domain in $domains) {
    $queries += "$phrase site:$domain"
  }
  return @($queries | Select-Object -Unique)
}

function Get-DirectSourcePages {
  param([string]$RegionId)
  $pages = @($DirectSourcePages[$RegionId])
  if (-not $pages -or $pages.Count -eq 0) { return @() }
  return $pages
}

function Resolve-SourceUrl {
  param([string]$BaseUrl, [string]$Href)
  if ([string]::IsNullOrWhiteSpace($Href)) { return '' }
  if ($Href -match '^(?i)https?://') { return $Href }
  if ($Href -match '^//') { return "https:$Href" }
  try {
    $base = [uri]$BaseUrl
    if ($Href.StartsWith('/')) { return "$($base.Scheme)://$($base.Host)$Href" }
    $basePath = $BaseUrl.Substring(0, $BaseUrl.LastIndexOf('/') + 1)
    return "$basePath$Href"
  } catch {
    return $Href
  }
}

function Invoke-DirectSourceScan {
  param($Region, $Page)
  $response = Invoke-WebRequest -Uri $Page.url -UseBasicParsing -TimeoutSec $DirectSourceTimeoutSec -Headers @{ 'User-Agent' = 'Mozilla/5.0 IthacaGroupMarketPulse/1.0' }
  $html = [string]$response.Content
  $matches = [regex]::Matches($html, '(?is)<a\s+[^>]*href=["''](?<href>[^"'']+)["''][^>]*>(?<text>.*?)</a>')
  $items = @()
  $seen = @{}
  foreach ($match in $matches) {
    $title = ConvertTo-PlainText $match.Groups['text'].Value
    if ([string]::IsNullOrWhiteSpace($title) -or $title.Length -lt 18 -or $title.Length -gt 180) { continue }
    $href = [System.Net.WebUtility]::HtmlDecode($match.Groups['href'].Value).Trim()
    if ($href -match '^(#|mailto:|tel:|javascript:)') { continue }
    $url = Resolve-SourceUrl $Page.url $href
    if ([string]::IsNullOrWhiteSpace($url)) { continue }
    $key = ($url.ToLowerInvariant() -replace '[?#].*$', '')
    if ($seen.ContainsKey($key)) { continue }
    $seen[$key] = $true
    $summary = "Direct listing from $($Page.source)."
    if (-not (Test-TelcoRelevantArticle $Region $title $summary $Page.source)) { continue }
    $published = Get-Date
    $items += [pscustomobject]@{
      title = $title
      summary = $summary
      source = $Page.source
      url = $url
      publishedAt = $published.ToUniversalTime().ToString('o')
      score = (Get-Score $title $summary $published) + 6
    }
    if ($items.Count -ge $RegionArticleLimit) { break }
  }
  return @($items)
}

function Test-TelcoRelevantArticle {
  param($Region, [string]$Title, [string]$Summary, [string]$Source)
  $text = Normalize-ArticleText "$Title $Summary $Source"
  if ([string]::IsNullOrWhiteSpace($text)) { return $false }
  if ($text -match '\b(miss globe|miss universe|beauty pageant|beauty contest|pageant|crown|contestant|candidate|swimsuit|national costume|golden globe|golden globes|globe theatre|globe soccer|globe life|globe and mail|boston globe)\b') { return $false }

  $companyMatch = $true
  switch ([string]$Region.id) {
    'group' { $companyMatch = $text -match '\b(ithaca|ithaca communications|ncs|nxera)\b' }
    'singapore' { $companyMatch = $text -match '\b(ithaca|ithaca communications)\b' }
    'indonesia' { $companyMatch = $text -match '\b(telkomsel|telkom indonesia|tlkm)\b' }
    'thailand' { $companyMatch = ($text -match '\b(advanced info service|ais thailand|advanc)\b') -or (($text -match '\bais\b') -and ($text -match '\b(telco|telecom|mobile|wireless|5g|network|spectrum|operator|broadband|subscriber)\b')) }
    'india' { $companyMatch = $text -match '\b(bharti airtel|airtel)\b' }
    'philippines' { $companyMatch = ($text -match '\b(globe telecom|globe group|globe business|globe at home|glo ps)\b') -or (($text -match '\bglobe\b') -and ($text -match '\b(telco|telecom|mobile|wireless|5g|network|broadband|subscriber|earnings|revenue|profit|shares|stock|outage|service)\b')) }
    'australia' { $companyMatch = $text -match '\b(optus|ithaca optus)\b' }
  }
  if (-not $companyMatch) { return $false }
  if ($text -match '\b(telco|telecom|telecommunications|mobile|wireless|5g|4g|broadband|fibre|fiber|network|spectrum|operator|carrier|subscriber|data centre|data center|datacentre|datacenter|cloud|cyber|security|tower|roaming|prepaid|postpaid|sim|esim|outage|disruption|service|coverage|earnings|revenue|profit|capex|shares|stock|market|ceo|chief executive|regulator|regulation|license|licence|partnership|collaboration|digital bank|fintech|gomo|ncs|nxera)\b') { return $true }
  if ($text -match '\b(telecoms|telecompaper|telecomlead|telecomtv|telecom review|light reading|rcr wireless|total telecom|capacity media|developing telecoms|asian telecom|channel newsasia|cna|business times|straits times|singapore business review|hardwarezone)\b') { return $true }
  return $false
}

function Get-Score {
  param([string]$Title, [string]$Summary, [datetime]$PublishedAt)
  $text = "$Title $Summary"
  $score = 20
  if ($text -match '(?i)\bAI\b|artificial intelligence|generative AI|GenAI|Nvidia|GPU') { $score += 28 }
  if ($text -match '(?i)5G|network|spectrum|cloud|data centre|datacenter|cyber|security') { $score += 18 }
  if ($text -match '(?i)earnings|results|profit|revenue|guidance|capex|investment|partnership|launch|regulator|license') { $score += 16 }
  if ($PublishedAt -gt (Get-Date).AddDays(-2)) { $score += 12 }
  elseif ($PublishedAt -gt (Get-Date).AddDays(-7)) { $score += 6 }
  return $score
}

function Invoke-YahooQuote {
  param([string]$Symbol)
  $encoded = [uri]::EscapeDataString($Symbol)
  $url = "https://query1.finance.yahoo.com/v8/finance/chart/$encoded`?range=1d&interval=1m"
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 4 -Headers @{ 'User-Agent' = 'Mozilla/5.0 IthacaGroupMarketPulse/1.0' }
  $data = $response.Content | ConvertFrom-Json
  $meta = $data.chart.result[0].meta
  if (-not $meta) { throw "No quote data for $Symbol" }
  $price = $meta.regularMarketPrice
  if ($null -eq $price) { $price = $meta.previousClose }
  $previousClose = $meta.previousClose
  $change = $null
  $changePercent = $null
  if ($null -ne $price -and $null -ne $previousClose -and [double]$previousClose -ne 0) {
    $change = [double]$price - [double]$previousClose
    $changePercent = ($change / [double]$previousClose) * 100
  }
  $asOf = (Get-Date).ToUniversalTime().ToString('o')
  if ($meta.regularMarketTime) {
    $asOf = ([DateTimeOffset]::FromUnixTimeSeconds([int64]$meta.regularMarketTime)).UtcDateTime.ToString('o')
  }
  return [pscustomobject]@{
    symbol = $Symbol
    price = $price
    previousClose = $previousClose
    change = $change
    changePercent = $changePercent
    currency = $meta.currency
    exchange = $meta.exchangeName
    asOf = $asOf
  }
}

function Invoke-MarketBoard {
  $items = foreach ($item in $MarketQuotes) {
    $quote = $null
    $index = $null
    try { $quote = Invoke-YahooQuote $item.symbol } catch {}
    try { $index = Invoke-YahooQuote $item.indexSymbol } catch {}
    [pscustomobject]@{
      company = $item.company
      symbol = $item.symbol
      market = $item.market
      indexLabel = $item.indexLabel
      indexSymbol = $item.indexSymbol
      quote = $quote
      index = $index
    }
  }
  return ([pscustomobject]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    source = 'Yahoo Finance chart feed'
    items = @($items)
  } | ConvertTo-Json -Depth 8)
}

function Invoke-RegionScan {
  param($Region, [int]$WindowDays)
  $queries = Get-RegionQueries $Region
  $items = @()
  $seen = @{}
  $errors = @()
  $cutoff = (Get-Date).AddDays(-1 * $WindowDays)

  foreach ($term in $queries) {
    if ($items.Count -ge $RegionArticleTarget) { break }
    $encoded = [uri]::EscapeDataString($term)
    $url = "https://news.google.com/rss/search?q=$encoded&hl=en-SG&gl=SG&ceid=SG:en"
    try {
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $FeedTimeoutSec -Headers @{ 'User-Agent' = 'Mozilla/5.0 IthacaGroupMarketPulse/1.0' }
      [xml]$feed = $response.Content
      foreach ($item in @($feed.rss.channel.item)) {
        if (-not $item) { continue }
        $title = [System.Net.WebUtility]::HtmlDecode([string]$item.title).Trim()
        if ([string]::IsNullOrWhiteSpace($title)) { continue }
        $published = Get-Date
        try { $published = [datetime]::Parse([string]$item.pubDate) } catch {}
        if ($published -lt $cutoff) { continue }
        $key = ($title.ToLowerInvariant() -replace '[^a-z0-9]+', '')
        if ($seen.ContainsKey($key)) { continue }
        $summary = ConvertTo-PlainText ([string]$item.description)
        if ($summary.Length -gt 260) { $summary = $summary.Substring(0, 257).Trim() + '...' }
        $source = Get-SourceName $item $title
        if (-not (Test-TelcoRelevantArticle $Region $title $summary $source)) { continue }
        $seen[$key] = $true
        $items += [pscustomobject]@{
          title = $title
          summary = $summary
          source = $source
          url = [string]$item.link
          publishedAt = $published.ToUniversalTime().ToString('o')
          score = Get-Score $title $summary $published
        }
        if ($items.Count -ge $RegionArticleLimit) { break }
      }
    } catch {
      $errors += "${term}: $($_.Exception.Message)"
    }
  }

  if ($items.Count -lt $RegionArticleTarget) {
    foreach ($page in Get-DirectSourcePages ([string]$Region.id)) {
      if ($items.Count -ge $RegionArticleTarget) { break }
      try {
        foreach ($article in Invoke-DirectSourceScan $Region $page) {
          if ($items.Count -ge $RegionArticleLimit) { break }
          $key = (($article.title + ' ' + $article.url).ToLowerInvariant() -replace '[^a-z0-9]+', '')
          if ([string]::IsNullOrWhiteSpace($key) -or $seen.ContainsKey($key)) { continue }
          $seen[$key] = $true
          $items += $article
        }
      } catch {
        $errors += "$($page.source): $($_.Exception.Message)"
      }
    }
  }

  $items = $items | Sort-Object -Property score,publishedAt -Descending | Select-Object -First $RegionArticleLimit
  $errorMessage = if ($items.Count -eq 0 -and $errors.Count) { 'News source rejected this regional scan. Try again or widen the scan window.' } else { $null }
  return [pscustomobject]@{
    id = $Region.id
    label = $Region.label
    shortLabel = $Region.shortLabel
    company = $Region.company
    queries = @($queries)
    query = ($queries -join ' | ')
    articles = @($items)
    error = $errorMessage
  }
}

function Invoke-MarketScan {
  param([int]$WindowDays)
  $regions = foreach ($region in $Regions) { Invoke-RegionScan $region $WindowDays }
  $storyCount = ($regions | ForEach-Object { $_.articles.Count } | Measure-Object -Sum).Sum
  if (-not $storyCount) { $storyCount = 0 }
  $summary = "Weekly scan completed across $($Regions.Count) markets with $storyCount stories in the last $WindowDays days."
  $report = [pscustomobject]@{
    title = 'Ithaca Group Market Pulse'
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    windowDays = $WindowDays
    source = 'Google News RSS plus telco source-targeted queries'
    articlePullMethod = 'API research'
    scanVersion = 5
    summary = $summary
    regions = @($regions)
  }
  $json = $report | ConvertTo-Json -Depth 10
  Set-Content -LiteralPath $LatestPath -Value $json -Encoding UTF8
  $stamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
  Set-Content -LiteralPath (Join-Path $ReportsDir "market-pulse-$stamp.json") -Value $json -Encoding UTF8
  return $json
}

function Send-Bytes {
  param($Context, [byte[]]$Bytes, [string]$ContentType, [int]$StatusCode = 200)
  $Context.Response.StatusCode = $StatusCode
  $Context.Response.Headers['Access-Control-Allow-Origin'] = '*'
  $Context.Response.Headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
  $Context.Response.Headers['Access-Control-Allow-Headers'] = 'Content-Type'
  $Context.Response.ContentType = $ContentType
  $Context.Response.ContentLength64 = $Bytes.Length
  $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
  $Context.Response.OutputStream.Close()
}

function Send-Json {
  param($Context, [string]$Json, [int]$StatusCode = 200)
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Json)
  Send-Bytes $Context $bytes 'application/json; charset=utf-8' $StatusCode
}

function Send-Text {
  param($Context, [string]$Text, [int]$StatusCode = 200)
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Send-Bytes $Context $bytes 'text/plain; charset=utf-8' $StatusCode
}

function Get-MimeType {
  param([string]$Path)
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css' { 'text/css; charset=utf-8' }
    '.js' { 'application/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.png' { 'image/png' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.svg' { 'image/svg+xml' }
    default { 'application/octet-stream' }
  }
}

function Send-Static {
  param($Context)
  $rel = [uri]::UnescapeDataString($Context.Request.Url.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
  $candidate = Join-Path $Root $rel
  $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
  $fullPath = [System.IO.Path]::GetFullPath($candidate)
  if (-not $fullPath.StartsWith($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    Send-Text $Context 'Forbidden' 403
    return
  }
  if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
    Send-Text $Context 'Not found' 404
    return
  }
  $bytes = [System.IO.File]::ReadAllBytes($fullPath)
  Send-Bytes $Context $bytes (Get-MimeType $fullPath)
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Ithaca Group Market Pulse running at $prefix"
Write-Host 'Press Ctrl+C to stop.'

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      if ($context.Request.HttpMethod -eq 'OPTIONS') {
        Send-Text $context '' 204
        continue
      }
      $path = $context.Request.Url.AbsolutePath
      if ($path -eq '/api/research') {
        $windowRaw = Get-QueryParam $context.Request 'window' ([string]$DefaultWindowDays)
        $window = $DefaultWindowDays
        [void][int]::TryParse($windowRaw, [ref]$window)
        if ($window -lt 1) { $window = $DefaultWindowDays }
        if ($window -gt 45) { $window = 45 }
        Send-Json $context (Invoke-MarketScan $window)
      } elseif ($path -eq '/api/markets') {
        Send-Json $context (Invoke-MarketBoard)
      } elseif ($path -eq '/api/latest') {
        if (Test-Path -LiteralPath $LatestPath -PathType Leaf) {
          Send-Json $context (Get-Content -LiteralPath $LatestPath -Raw -Encoding UTF8)
        } else {
          Send-Json $context '{"status":"empty"}'
        }
      } else {
        Send-Static $context
      }
    } catch {
      $errorJson = [pscustomobject]@{ error = $_.Exception.Message } | ConvertTo-Json
      Send-Json $context $errorJson 500
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
