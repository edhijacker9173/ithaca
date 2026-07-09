# Ithaca Group Market Pulse

An AI Codex Project for recurring Ithaca Group market intelligence work.

## What it does

- Serves an interactive regional news dashboard.
- Runs a live Google News RSS scan with Bing News RSS fallback from the Status panel `Refresh` button.
- Groups stories by Ithaca market and associate:
  - Group / Regional: Ithaca Group, NCS, Nxera
  - Singapore: Ithaca
  - Indonesia: Telkomsel
  - Thailand: AIS / Advanced Info Service
  - India: Bharti Airtel
  - Philippines: Globe Telecom
  - Australia: Optus
- Stores the latest browser-run report and color theme preference in local storage.
- Exports the weekly report as JSON.

## Run locally

Open this file in your browser:

```text
C:\Users\edwintong\Downloads\Ithaca\MarketPulse\index.html
```

The browser app uses Google News RSS through public CORS RSS proxies when no local backend is available.


## Local stock snapshot workaround

Browsers block many live finance calls from a local `file://` page because of CORS. If the PowerShell backend is blocked by Windows Constrained Language mode, use the snapshot helper instead:

```powershell
cd C:\Users\edwintong\Downloads\Ithaca\MarketPulse
.\refresh-stock-snapshot.cmd
```

The helper uses `curl.exe` outside the browser to query Yahoo Finance chart data, then writes:

```text
data\market-snapshot.json
data\market-snapshot.js
```

`index.html` loads `data/market-snapshot.js` before `app.js`, so the market board can display the latest captured snapshot even when opened directly from local disk.

## Optional local backend

A PowerShell backend is included at `server.ps1`. If your Windows policy allows `HttpListener`, you can run:

```powershell
cd C:\Users\edwintong\Downloads\Ithaca\MarketPulse
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Then open:

```text
http://localhost:8765
```

The backend saves the latest report to `data/latest-report.json` and timestamped history to `data/reports/`.

Refreshes now prefer this backend route, so the scan can continue as a background server task even if the browser tab is not active.

## Workflow

1. Open the app.
2. Select a scan window.
3. Click `Refresh` from the Status panel.
4. Review top stories by region.
5. Use `Export JSON` or `Print Brief` for weekly documentation.


## News source controls

The news scan starts with Google News RSS and Bing News RSS, then adds source-targeted searches using `site:` filters from `data/telco-news-sites.md` for telecom trade publications such as Telecoms.com, Light Reading, Telecompaper, Developing Telecoms, TelecomLead, Telecom Review, and Asian Telecom. Singapore coverage also includes source-targeted searches for Channel NewsAsia, The Business Times, and The Straits Times, plus direct category-page checks for Singapore Business Review Telecom & Internet and HardwareZone Mobile Telco.

The app also applies a relevance gate before adding stories. Articles must mention the relevant Ithaca associate or OpCo and include telco, network, financial, regulatory, AI, cloud, or market context. Common false-positive contexts such as Miss Globe, pageants, Golden Globes, theatre, sports, and non-telco Globe references are excluded.

## Notes

Direct browser crawling is blocked by CORS on many news sources. This app uses Google News RSS, then Bing News RSS as a secondary feed, through public RSS proxy endpoints from the browser. Each region is scanned through several small searches, then merged and deduplicated, because long Boolean RSS queries can trigger HTTP 400 responses. For more controlled production use, replace the proxy path with an internal backend or approved news API.










