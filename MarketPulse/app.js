const REGION_ORDER = [
  'group',
  'singapore',
  'indonesia',
  'thailand',
  'india',
  'philippines',
  'australia'
];

const REGIONS = [
  {
    id: 'group',
    label: 'Group / Regional',
    shortLabel: 'Group',
    company: 'Ithaca Group, NCS, Nxera',
    queries: [
      'Ithaca',
      '"Ithaca Group"',
      'NCS Singapore',
      'Nxera Ithaca',
      '"Ithaca AI"',
      '"Ithaca data centre"'
    ]
  },
  {
    id: 'singapore',
    label: 'Singapore',
    shortLabel: 'Singapore',
    company: 'Ithaca',
    queries: [
      'Ithaca',
      '"Ithaca Communications"',
      '"Ithaca Singapore"',
      '"Ithaca 5G"',
      '"Ithaca AI"'
    ]
  },
  {
    id: 'indonesia',
    label: 'Indonesia',
    shortLabel: 'Indonesia',
    company: 'Telkomsel',
    queries: [
      'Telkomsel',
      '"Telkomsel AI"',
      '"Telkomsel 5G"',
      '"Telkomsel data centre"'
    ]
  },
  {
    id: 'thailand',
    label: 'Thailand',
    shortLabel: 'Thailand',
    company: 'AIS / Advanced Info Service',
    queries: [
      '"Advanced Info Service"',
      '"AIS Thailand"',
      '"AIS 5G"',
      '"AIS telecom"'
    ]
  },
  {
    id: 'india',
    label: 'India',
    shortLabel: 'India',
    company: 'Bharti Airtel',
    queries: [
      '"Bharti Airtel"',
      '"Airtel India"',
      '"Airtel AI"',
      '"Airtel 5G"',
      '"Airtel data centre"'
    ]
  },
  {
    id: 'philippines',
    label: 'Philippines',
    shortLabel: 'Philippines',
    company: 'Globe Telecom',
    queries: [
      '"Globe Telecom"',
      '"Globe Telecom Philippines"',
      '"Globe Telecom 5G"',
      '"Globe Telecom AI"',
      '"Globe Telecom network"',
      '"Globe Telecom earnings"'
    ]
  },
  {
    id: 'australia',
    label: 'Australia',
    shortLabel: 'Australia',
    company: 'Optus',
    queries: [
      'Optus',
      '"Ithaca Optus"',
      '"Optus AI"',
      '"Optus 5G"',
      '"Optus outage"',
      '"Optus network"'
    ]
  }
];

const TELCO_NEWS_SOURCE_DOMAINS = [
  'telecoms.com',
  'lightreading.com',
  'telecompaper.com',
  'totaltele.com',
  'rcrwireless.com',
  'telecomtv.com',
  'capacitymedia.com',
  'telecomreview.com',
  'developingtelecoms.com',
  'telecomlead.com',
  'telecomramblings.com',
  'asiantelecom.com'
];

const REGION_TELCO_SOURCE_DOMAINS = {
  group: ['telecoms.com', 'lightreading.com', 'asiantelecom.com', 'telecomreview.com', 'developingtelecoms.com'],
  singapore: ['telecoms.com', 'lightreading.com', 'asiantelecom.com', 'telecomreview.com', 'developingtelecoms.com', 'channelnewsasia.com', 'businesstimes.com.sg', 'straitstimes.com.sg', 'sbr.com.sg', 'hardwarezone.com.sg'],
  indonesia: ['developingtelecoms.com', 'asiantelecom.com', 'telecomreview.com', 'telecoms.com'],
  thailand: ['developingtelecoms.com', 'asiantelecom.com', 'telecomreview.com', 'telecoms.com'],
  india: ['telecomlead.com', 'developingtelecoms.com', 'telecompaper.com', 'telecoms.com'],
  philippines: ['developingtelecoms.com', 'asiantelecom.com', 'telecomreview.com', 'telecoms.com'],
  australia: ['telecompaper.com', 'lightreading.com', 'telecoms.com', 'totaltele.com']
};

const DIRECT_SOURCE_PAGES = {
  singapore: [
    {
      source: 'Singapore Business Review',
      url: 'https://sbr.com.sg/telecom-internet'
    },
    {
      source: 'HardwareZone',
      url: 'https://www.hardwarezone.com.sg/mobile/telco'
    }
  ]
};
const REGION_SOURCE_SEARCH_PHRASES = {
  group: 'Ithaca',
  singapore: 'Ithaca',
  indonesia: 'Telkomsel',
  thailand: '"AIS Thailand"',
  india: '"Bharti Airtel"',
  philippines: '"Globe Telecom"',
  australia: 'Optus'
};

function directSourcePagesForRegion(regionId) {
  return DIRECT_SOURCE_PAGES[regionId] || [];
}
function sourceSearchPhrase(region) {
  return REGION_SOURCE_SEARCH_PHRASES[region.id] || region.company || region.label;
}

function sourceDomainsForRegion(regionId) {
  return REGION_TELCO_SOURCE_DOMAINS[regionId] || TELCO_NEWS_SOURCE_DOMAINS.slice(0, 4);
}

function buildRegionQueries(region) {
  const baseQueries = region.queries || [region.query].filter(Boolean);
  const sourceQueries = sourceDomainsForRegion(region.id).map(domain => `${sourceSearchPhrase(region)} site:${domain}`);
  return Array.from(new Set([...baseQueries, ...sourceQueries]));
}
const REGION_META = {
  all: { flag: 'all', label: 'All Regions' },
  singapore: { flag: 'sg', label: 'Singapore' },
  indonesia: { flag: 'id', label: 'Indonesia' },
  thailand: { flag: 'th', label: 'Thailand' },
  india: { flag: 'in', label: 'India' },
  philippines: { flag: 'ph', label: 'Philippines' },
  australia: { flag: 'au', label: 'Australia' }
};
const MARKET_QUOTES = [
  { company: 'Singtel', symbol: 'Z74.SI', market: 'SGX', indexLabel: 'STI', indexSymbol: '^STI' },
  { company: 'Bharti Airtel', symbol: 'BHARTIARTL.NS', market: 'NSE', indexLabel: 'Nifty 50', indexSymbol: '^NSEI' },
  { company: 'AIS', symbol: 'ADVANC.BK', market: 'SET', indexLabel: 'SET Index', indexSymbol: '^SET.BK' },
  { company: 'Globe Telecom', symbol: 'GLO.PS', market: 'PSE', indexLabel: 'PSEi', indexSymbol: 'PSEI.PS' },
  { company: 'Telkom Indonesia', symbol: 'TLKM.JK', market: 'IDX', indexLabel: 'JCI', indexSymbol: '^JKSE' },
  { company: 'Optus parent', symbol: 'Z74.SI', market: 'SGX', indexLabel: 'ASX 200', indexSymbol: '^AXJO' }
];

const TAGS = ['AI', '5G', 'cloud', 'data centre', 'network', 'regulation', 'earnings', 'partnership', 'cybersecurity'];
const STORAGE_KEY = 'ithaca-market-pulse-latest-v5';
const THEME_KEY = 'ithaca-market-pulse-theme';
const SCAN_VERSION = 5;
const LOCAL_BACKEND_ORIGIN = 'http://localhost:8765';
const BACKEND_SCAN_TIMEOUT_MS = 90000;
const RSS_FETCH_TIMEOUT_MS = 9000;
const DIRECT_SOURCE_TIMEOUT_MS = 12000;
const REGION_ARTICLE_TARGET = 12;
const REGION_ARTICLE_LIMIT = 18;

let state = {
  report: null,
  activeRegion: 'all',
  query: '',
  loading: false,
  scanProgressDetail: { percent: 0, label: 'Idle' },
  marketBoard: null,
  marketStatus: 'Loading market data'
};

let activeScanController = null;

const els = {
  scanBtn: document.getElementById('scanBtn'),
  themeButtons: Array.from(document.querySelectorAll('[data-theme-option]')),
  exportBtn: document.getElementById('exportBtn'),
  printBtn: document.getElementById('printBtn'),
  scanStatus: document.getElementById('scanStatus'),
  scanProgress: document.getElementById('scanProgress'),
  scanProgressBar: document.getElementById('scanProgressBar'),
  lastUpdated: document.getElementById('lastUpdated'),
  heroStandfirst: document.getElementById('heroStandfirst'),
  windowSelect: document.getElementById('windowSelect'),
  regionTabs: document.getElementById('regionTabs'),
  searchInput: document.getElementById('searchInput'),
  leadStory: document.getElementById('leadStory'),
  statGrid: document.getElementById('statGrid'),
  coverageList: document.getElementById('coverageList'),
  tagCloud: document.getElementById('tagCloud'),
  regionFeed: document.getElementById('regionFeed'),
  storyTemplate: document.getElementById('storyTemplate')
};

function applyTheme(theme) {
  const selected = ['dark', 'neutral', 'light'].includes(theme) ? theme : 'dark';
  document.body.dataset.theme = selected;
  els.themeButtons.forEach(button => {
    const active = button.dataset.themeOption === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  try { localStorage.setItem(THEME_KEY, selected); } catch {}
}

function loadTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return ['dark', 'neutral', 'light'].includes(theme) ? theme : 'dark';
  } catch {
    return 'dark';
  }
}
function formatEta(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '';
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s left`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s left`;
}

function totalScanSearches() {
  return REGIONS.reduce((sum, region) => sum + buildRegionQueries(region).length + directSourcePagesForRegion(region.id).length, 0);
}

function setScanProgress(value) {
  const detail = typeof value === 'object' && value !== null ? value : { percent: Number(value) || 0 };
  const percent = detail.total
    ? (Number(detail.completed) / Number(detail.total)) * 100
    : Number(detail.percent) || 0;
  const normalized = Math.max(0, Math.min(100, Math.round(percent)));
  state.scanProgressDetail = { ...detail, percent: normalized };
  if (!els.scanProgress) return;
  if (els.scanProgressBar) {
    els.scanProgressBar.style.width = `${normalized}%`;
    const meter = els.scanProgressBar.closest('.scan-meter');
    if (meter) meter.setAttribute('aria-valuenow', String(normalized));
  }

  if (detail.label) {
    els.scanProgress.textContent = detail.label;
    return;
  }

  if (detail.total) {
    const eta = formatEta(detail.etaMs);
    els.scanProgress.textContent = `${normalized}% - ${detail.completed}/${detail.total} searches checked${eta ? ` - ${eta}` : ''}`;
    return;
  }

  els.scanProgress.textContent = `${normalized}%`;
}
function startEstimatedScanProgress(signal) {
  const total = totalScanSearches();
  const expectedMs = Math.max(16000, total * 1200);
  const startedAt = Date.now();
  setScanProgress({ percent: 0, label: `Starting scan - 0/${total} searches queued` });
  const timer = window.setInterval(() => {
    if (signal?.aborted) return;
    const elapsed = Date.now() - startedAt;
    const estimatedRatio = Math.min(0.92, elapsed / expectedMs);
    const completed = Math.min(total - 1, Math.floor(total * estimatedRatio));
    const etaMs = Math.max(expectedMs - elapsed, 1000);
    setScanProgress({
      percent: estimatedRatio * 100,
      label: `${Math.round(estimatedRatio * 100)}% - ${completed}/${total} searches estimated - ${formatEta(etaMs)}`
    });
  }, 700);
  return () => window.clearInterval(timer);
}
function scanIsRunning() {
  return Boolean(activeScanController && !activeScanController.signal.aborted);
}

function syncScanButtonState(labelOverride) {
  const busy = state.loading || scanIsRunning();
  els.scanBtn.disabled = false;
  els.scanBtn.textContent = labelOverride || (busy ? 'Stop Refresh' : 'Refresh');
  els.scanBtn.classList.toggle('is-stop', busy);
  els.scanBtn.setAttribute('aria-label', busy ? 'Stop the current refresh' : 'Refresh market pulse');
}

function setStatus(text, busy = false) {
  const preserveScanStatus = scanIsRunning() && !busy && text === 'Ready';
  state.loading = busy || scanIsRunning();
  if (!preserveScanStatus) els.scanStatus.textContent = text;
  syncScanButtonState();
  if (!state.loading && text === 'Ready' && state.scanProgressDetail.label === 'Idle') {
    setScanProgress({ percent: state.report ? 100 : 0, label: 'Ready' });
  }
}

function stopActiveScan() {
  if (!activeScanController || activeScanController.signal.aborted) return;
  activeScanController.abort();
  setStatus('Stopping refresh...', true);
  els.scanBtn.textContent = 'Stopping...';
  setScanProgress({ ...state.scanProgressDetail, label: 'Stopping refresh...' });
}

function isAbortError(error) {
  return error?.name === 'AbortError' || /abort|stopped/i.test(error?.message || '');
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  throw new DOMException('Refresh stopped', 'AbortError');
}

function combineAbortSignals(signals) {
  const activeSignals = signals.filter(Boolean);
  if (!activeSignals.length) return undefined;
  if (activeSignals.length === 1) return activeSignals[0];
  const controller = new AbortController();
  const abort = () => controller.abort();
  activeSignals.forEach(signal => {
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
  return controller.signal;
}
function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatShortDate(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-SG', { day: '2-digit', month: 'short' }).format(date);
}

function formatMarketNumber(value, currency = '') {
  const number = Number(value);
  if (!Number.isFinite(number)) return '--';
  const decimals = Math.abs(number) >= 1000 ? 0 : 2;
  return `${currency ? `${currency} ` : ''}${new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)}`;
}

function formatMarketChange(change, changePercent) {
  const rawChange = Number(change);
  const rawPercent = Number(changePercent);
  if (!Number.isFinite(rawChange) && !Number.isFinite(rawPercent)) return '--';
  const signedChange = Number.isFinite(rawChange) ? `${rawChange >= 0 ? '+' : ''}${rawChange.toFixed(2)}` : '';
  const signedPercent = Number.isFinite(rawPercent) ? `${rawPercent >= 0 ? '+' : ''}${rawPercent.toFixed(2)}%` : '';
  return [signedChange, signedPercent].filter(Boolean).join(' / ');
}


function marketSnapshotStatus(board) {
  if (!board?.items?.some(item => item.quote || item.index)) return 'Market snapshot unavailable';
  return `Snapshot ${formatDate(board.generatedAt)}`;
}

function applyReportMarketSnapshot(report) {
  const snapshot = normalizeQuotePayload(report?.marketSnapshot);
  if (!snapshot?.items?.some(item => item.quote || item.index)) return false;
  state.marketBoard = snapshot;
  state.marketStatus = marketSnapshotStatus(snapshot);
  return true;
}
function normalizeQuotePayload(payload) {
  if (!payload || !Array.isArray(payload.items)) return null;
  return {
    generatedAt: payload.generatedAt || new Date().toISOString(),
    source: payload.source || 'Market data feed',
    items: payload.items.map(item => ({
      ...item,
      quote: item.quote || null,
      index: item.index || null
    }))
  };
}

function applyEmbeddedMarketSnapshot() {
  const snapshot = normalizeQuotePayload(window.MARKET_SNAPSHOT);
  if (!snapshot?.items?.some(item => item.quote || item.index)) return false;
  state.marketBoard = snapshot;
  state.marketStatus = marketSnapshotStatus(snapshot);
  return true;
}
async function fetchJsonWithProxy(jsonUrl, signal) {
  const urls = [
    jsonUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(jsonUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(jsonUrl)}`
  ];
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, { signal }, 4000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      return JSON.parse(text);
    } catch (error) {
      if (isAbortError(error)) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error('JSON feed failed');
}
async function fetchYahooQuote(symbol, signal) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
  const data = await fetchJsonWithProxy(url, signal);
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('No quote data');
  const price = Number(meta.regularMarketPrice ?? meta.previousClose);
  const previousClose = Number(meta.previousClose);
  const change = Number.isFinite(price) && Number.isFinite(previousClose) ? price - previousClose : null;
  const changePercent = Number.isFinite(change) && previousClose ? (change / previousClose) * 100 : null;
  return {
    symbol,
    price,
    previousClose: Number.isFinite(previousClose) ? previousClose : null,
    change,
    changePercent,
    currency: meta.currency || '',
    exchange: meta.exchangeName || meta.fullExchangeName || '',
    asOf: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString()
  };
}

async function fetchMarketBoardDirect(signal) {
  const items = await Promise.all(MARKET_QUOTES.map(async item => {
    const [quote, index] = await Promise.allSettled([
      fetchYahooQuote(item.symbol, signal),
      fetchYahooQuote(item.indexSymbol, signal)
    ]);
    return {
      ...item,
      quote: quote.status === 'fulfilled' ? quote.value : null,
      index: index.status === 'fulfilled' ? index.value : null
    };
  }));
  return {
    generatedAt: new Date().toISOString(),
    source: 'Yahoo Finance chart feed',
    items
  };
}

async function loadMarketBoard(options = {}) {
  const signal = options.signal;
  const captureLabel = options.capture ? 'Capturing market snapshot' : 'Loading market data';
  state.marketStatus = captureLabel;
  renderStats();

  if (applyEmbeddedMarketSnapshot()) {
    renderStats();
    return state.marketBoard;
  }

  if (window.location.protocol === 'file:' && !options.capture) {
    state.marketBoard = { generatedAt: new Date().toISOString(), source: 'Local file mode', items: MARKET_QUOTES.map(item => ({ ...item, quote: null, index: null })) };
    state.marketStatus = 'Run refresh-stock-snapshot.cmd for local stock data';
    renderStats();
    return state.marketBoard;
  }

  try {
    let payload = null;
    try {
      const response = await fetchWithTimeout('/api/markets', { signal }, 12000);
      if (response.ok) payload = await response.json();
    } catch (error) {
      if (isAbortError(error)) throw error;
    }
    if (!payload) payload = await fetchMarketBoardDirect(signal);
    state.marketBoard = normalizeQuotePayload(payload);
    state.marketStatus = marketSnapshotStatus(state.marketBoard);
  } catch (error) {
    if (isAbortError(error)) throw error;
    state.marketBoard = null;
    state.marketStatus = 'Market snapshot unavailable';
  }
  renderStats();
  return state.marketBoard;
}
function stripHtml(value) {
  const div = document.createElement('div');
  div.innerHTML = value || '';
  return div.textContent.replace(/\s+/g, ' ').trim();
}

function buildNewsFeedUrls(term) {
  const encoded = encodeURIComponent(term);
  return [
    `https://news.google.com/rss/search?q=${encoded}&hl=en-SG&gl=SG&ceid=SG:en`,
    `https://www.bing.com/news/search?q=${encoded}&format=rss`
  ];
}

function sourceLabelFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Source page';
  }
}

function extractDirectSourceArticles(page, html, region) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const source = page.source || sourceLabelFromUrl(page.url);
  const pageHost = sourceLabelFromUrl(page.url);
  const articles = [];
  const seenUrls = new Set();

  Array.from(doc.querySelectorAll('a[href]')).forEach(anchor => {
    const rawTitle = stripHtml(anchor.getAttribute('title') || anchor.getAttribute('aria-label') || anchor.textContent || '');
    const title = rawTitle.replace(/\s+/g, ' ').trim();
    if (title.length < 18 || title.length > 180) return;

    const href = anchor.getAttribute('href') || '';
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return;

    let url = '';
    try {
      url = new URL(href, page.url).href;
    } catch {
      return;
    }

    if (seenUrls.has(url)) return;
    seenUrls.add(url);

    const summary = `Direct listing from ${source}.`;
    const publishedAt = new Date().toISOString();
    const article = {
      title,
      summary,
      source,
      url,
      publishedAt,
      score: scoreStory(title, summary, publishedAt) + (pageHost.includes('sbr.com.sg') || pageHost.includes('hardwarezone.com.sg') ? 6 : 3)
    };

    if (!isTelcoRelevantArticle(article, region)) return;
    articles.push(article);
  });

  return articles;
}
function readItemText(item, selectors) {
  for (const selector of selectors) {
    const value = item.querySelector(selector)?.textContent;
    if (value) return value;
  }
  return '';
}
function sourceFromTitle(title) {
  const parts = String(title || '').split(' - ');
  return parts.length > 1 ? parts.pop().trim() : '';
}

function cleanArticleTitle(title, source = '') {
  let cleaned = stripHtml(title);
  const suffix = source ? ` - ${source}` : '';
  if (suffix && cleaned.endsWith(suffix)) cleaned = cleaned.slice(0, -suffix.length).trim();
  return cleaned.replace(/\s+-\s+[^-]{2,90}$/g, '').replace(/\s+/g, ' ').trim();
}

const TITLE_STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'from', 'after', 'amid', 'with', 'by', 'as', 'at', 'into', 'over',
  'its', 'their', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'now', 'latest', 'says', 'said', 's'
]);

const TOKEN_STEMS = {
  cuts: 'cut', cutting: 'cut', reduced: 'reduce', reduces: 'reduce', reducing: 'reduce', falls: 'fall', fell: 'fall', fallen: 'fall',
  failures: 'failure', outages: 'outage', networks: 'network', results: 'result', earnings: 'earning', millions: 'million', mil: 'million',
  reits: 'reit', centres: 'centre', centers: 'centre', datacenter: 'centre', datacentres: 'centre', datacenters: 'centre'
};

function normalizeComparableText(value) {
  return stripHtml(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/&amp;/g, '&')
    .toLowerCase()
    .replace(/\b(us|s|sgd|usd|php|idr|inr|thb)\$?/g, ' ')
    .replace(/\$|s\$|us\$/g, ' ')
    .replace(/[^a-z0-9.%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeToken(token) {
  const clean = token.replace(/^\.+|\.+$/g, '');
  if (!clean) return '';
  if (/^\d+(\.\d+)?%?$/.test(clean)) return clean.replace(/%$/, 'pct');
  return TOKEN_STEMS[clean] || clean;
}

function articleTokens(article) {
  const text = normalizeComparableText(`${article?.title || ''} ${article?.summary || ''}`);
  const tokens = text.split(' ')
    .map(normalizeToken)
    .filter(token => token && (!TITLE_STOP_WORDS.has(token)) && (token.length > 2 || /\d/.test(token)));
  return new Set(tokens);
}

function titleKey(title) {
  return Array.from(articleTokens({ title, summary: '' })).join('');
}

function urlKey(url) {
  try {
    const parsed = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'oc', 'partner'].forEach(param => parsed.searchParams.delete(param));
    parsed.hash = '';
    return `${parsed.hostname}${parsed.pathname}${parsed.search}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function articleKey(article) {
  const key = titleKey(article?.title || '');
  return key || urlKey(article?.url || '');
}

const TELCO_CONTEXT_PATTERN = /\b(telco|telecom|telecommunications|mobile|wireless|5g|4g|broadband|fibre|fiber|network|spectrum|operator|carrier|subscriber|data centre|data center|datacentre|datacenter|cloud|cyber|security|tower|roaming|prepaid|postpaid|sim|esim|outage|disruption|service|coverage|earnings|revenue|profit|capex|shares|stock|market|ceo|chief executive|regulator|regulation|license|licence|partnership|collaboration|digital bank|fintech|gomo|ncs|nxera)\b/i;
const OUT_OF_CONTEXT_PATTERN = /\b(miss globe|miss universe|beauty pageant|beauty contest|pageant|crown|contestant|candidate|swimsuit|national costume|golden globe|golden globes|globe theatre|globe soccer|globe life|globe and mail|boston globe)\b/i;

function hasTelcoContext(text) {
  return TELCO_CONTEXT_PATTERN.test(text);
}

function sourceLooksTelco(source) {
  const normalized = normalizeComparableText(source || '');
  return /\b(telecoms|telecompaper|telecomlead|telecomtv|telecom review|light reading|rcr wireless|total telecom|capacity media|developing telecoms|asian telecom|channel newsasia|cna|business times|straits times|singapore business review|hardwarezone)\b/.test(normalized);
}

function regionCompanyMention(text, region) {
  const normalized = normalizeComparableText(text);
  switch (region.id) {
    case 'group':
      return /\b(ithaca|ithaca communications|ncs|nxera)\b/.test(normalized);
    case 'singapore':
      return /\b(ithaca|ithaca communications)\b/.test(normalized);
    case 'indonesia':
      return /\b(telkomsel|telkom indonesia|tlkm)\b/.test(normalized);
    case 'thailand':
      return /\b(advanced info service|ais thailand|advanc)\b/.test(normalized) || (/\bais\b/.test(normalized) && hasTelcoContext(normalized));
    case 'india':
      return /\b(bharti airtel|airtel)\b/.test(normalized);
    case 'philippines':
      return /\b(globe telecom|globe group|globe business|globe at home|glo ps)\b/.test(normalized) || (/\bglobe\b/.test(normalized) && hasTelcoContext(normalized));
    case 'australia':
      return /\b(optus|ithaca optus)\b/.test(normalized);
    default:
      return true;
  }
}

function isTelcoRelevantArticle(article, region) {
  const combined = `${article?.title || ''} ${article?.summary || ''} ${article?.source || ''}`;
  const normalized = normalizeComparableText(combined);
  if (!normalized) return false;
  if (OUT_OF_CONTEXT_PATTERN.test(normalized)) return false;
  if (!regionCompanyMention(normalized, region)) return false;
  if (hasTelcoContext(normalized)) return true;
  if (sourceLooksTelco(article?.source)) return true;
  return false;
}
function articleCompany(text) {
  if (/\b(ithaca|ithaca communications)\b/.test(text)) return 'ithaca';
  if (/\b(optus)\b/.test(text)) return 'optus';
  if (/\b(telkomsel|telkom indonesia|tlkm)\b/.test(text)) return 'telkomsel';
  if (/\b(bharti airtel|airtel)\b/.test(text)) return 'airtel';
  if (/\b(globe telecom|globe)\b/.test(text)) return 'globe';
  if (/\b(advanced info service|ais thailand|ais)\b/.test(text)) return 'ais';
  if (/\b(ncs)\b/.test(text)) return 'ncs';
  if (/\b(nxera)\b/.test(text)) return 'nxera';
  return 'group';
}

function articleTopicBucket(article) {
  const text = normalizeComparableText(`${article?.title || ''} ${article?.summary || ''}`);
  const company = articleCompany(text);
  if (/\b(ceo|chief executive|executive)\b/.test(text) && /\b(pay|salary|compensation|remuneration)\b/.test(text)) return `${company}:ceo-pay`;
  if (/\breit\b/.test(text) && /\b(ai|artificial intelligence)\b/.test(text) && /\b(infrastructure|funding|centre|datacentre|datacenter)\b/.test(text)) return `${company}:reit-ai-infra`;
  if (/\b(outage|failure|disruption)\b/.test(text) && /\b(network|mobile|service)\b/.test(text)) return `${company}:network-outage`;
  if (/\b(results|profit|revenue|earnings|guidance)\b/.test(text)) return `${company}:financial-results`;
  if (/\b(partnership|partners|deal|collaboration)\b/.test(text) && /\b(ai|cloud|5g|data)\b/.test(text)) return `${company}:strategic-partnership`;
  return '';
}

function buildArticleDedupeMeta(article) {
  const tokens = articleTokens(article);
  const keys = [articleKey(article), urlKey(article?.url || '')].filter(Boolean);
  const numbers = Array.from(tokens).filter(token => /\d/.test(token));
  return {
    article,
    keys: new Set(keys),
    topic: articleTopicBucket(article),
    tokens,
    numbers: new Set(numbers)
  };
}

function hasSharedNumber(a, b) {
  for (const value of a.numbers) {
    if (b.numbers.has(value)) return true;
  }
  return false;
}

function articleSimilarity(a, b) {
  let overlap = 0;
  for (const token of a.tokens) {
    if (b.tokens.has(token)) overlap += 1;
  }
  const union = new Set([...a.tokens, ...b.tokens]).size || 1;
  return { overlap, jaccard: overlap / union };
}

function isDuplicateNewsContent(meta, existing) {
  for (const key of meta.keys) {
    if (existing.keys.has(key)) return true;
  }
  if (meta.topic && meta.topic === existing.topic) return true;
  const similarity = articleSimilarity(meta, existing);
  if (similarity.overlap >= 7 && similarity.jaccard >= 0.42) return true;
  if (hasSharedNumber(meta, existing) && similarity.overlap >= 5 && similarity.jaccard >= 0.32) return true;
  return false;
}

function dedupeArticles(articles, sharedBank = []) {
  const localBank = [];
  const unique = [];
  (articles || []).forEach(article => {
    const meta = buildArticleDedupeMeta(article);
    if (!meta.keys.size && !meta.tokens.size) return;
    const duplicate = [...localBank, ...sharedBank].some(existing => isDuplicateNewsContent(meta, existing));
    if (duplicate) return;
    localBank.push(meta);
    sharedBank.push(meta);
    unique.push(article);
  });
  return unique;
}

function dedupeReportRegions(regions) {
  const sharedBank = [];
  const resultById = new Map();
  const orderedForDedupe = [
    ...(regions || []).filter(region => region.id !== 'group'),
    ...(regions || []).filter(region => region.id === 'group')
  ];

  orderedForDedupe.forEach(region => {
    const sorted = [...(region.articles || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const articles = dedupeArticles(sorted, sharedBank).slice(0, 8);
    resultById.set(region.id, {
      ...region,
      articles,
      error: articles.length ? null : region.error
    });
  });

  return (regions || []).map(region => resultById.get(region.id) || { ...region, articles: [] });
}
function enforceUniqueNewsContent(report) {
  if (!report) return report;
  return {
    ...report,
    regions: dedupeReportRegions(report.regions || [])
  };
}
function normalizeReport(report) {
  if (!report) return report;
  const uniqueReport = enforceUniqueNewsContent(report);
  const storyCount = (uniqueReport.regions || []).reduce((sum, region) => sum + (region.articles || []).length, 0);
  const windowDays = uniqueReport.windowDays || report.windowDays || els.windowSelect?.value || 7;
  return {
    ...uniqueReport,
    scanVersion: SCAN_VERSION,
    summary: `Weekly scan completed across ${(uniqueReport.regions || []).length} markets with ${storyCount} unique stories in the last ${windowDays} days.`
  };
}
function scoreStory(title, summary, publishedAt) {
  const text = `${title} ${summary}`;
  let score = 20;
  if (/\b(ai|artificial intelligence|generative ai|genai|nvidia|gpu)\b/i.test(text)) score += 28;
  if (/5g|network|spectrum|cloud|data centre|datacenter|cyber|security/i.test(text)) score += 18;
  if (/earnings|results|profit|revenue|guidance|capex|investment|partnership|launch|regulator|license/i.test(text)) score += 16;
  const age = Date.now() - new Date(publishedAt).getTime();
  if (age < 2 * 86400000) score += 12;
  else if (age < 7 * 86400000) score += 6;
  return score;
}

function allRegions() {
  if (!state.report || !state.report.regions) return [];
  return REGION_ORDER
    .map(id => state.report.regions.find(region => region.id === id))
    .filter(Boolean)
    .concat(state.report.regions.filter(region => !REGION_ORDER.includes(region.id)));
}

function allStories() {
  return allRegions().flatMap(region => (region.articles || []).map(article => ({ ...article, region })));
}

function filteredRegions() {
  const q = state.query.trim().toLowerCase();
  return allRegions()
    .filter(region => state.activeRegion === 'all' || region.id === state.activeRegion)
    .map(region => {
      const articles = (region.articles || []).filter(article => {
        if (!q) return true;
        return [article.title, article.summary, article.source, region.label, region.company]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
      return { ...region, articles };
    })
    .filter(region => region.articles.length || !q);
}

function renderTabs() {
  const regions = allRegions();
  els.regionTabs.innerHTML = '';
  els.regionTabs.appendChild(createTab('All Regions', 'all'));
  regions
    .filter(region => region.id !== 'group')
    .forEach(region => els.regionTabs.appendChild(createTab(region.shortLabel || region.label, region.id)));
}

function createTab(label, id) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `region-tab${state.activeRegion === id ? ' active' : ''}`;
  const meta = REGION_META[id] || {};
  if (meta.flag) {
    const flag = document.createElement('span');
    flag.className = `flag flag-${meta.flag}`;
    flag.setAttribute('aria-hidden', 'true');
    btn.appendChild(flag);
  }
  const text = document.createElement('span');
  text.textContent = label;
  btn.appendChild(text);
  btn.addEventListener('click', () => {
    state.activeRegion = id;
    render();
  });
  return btn;
}
function renderStats() {
  els.statGrid.className = 'market-board';
  els.statGrid.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'market-board-head';
  const title = document.createElement('span');
  title.textContent = 'Market board';
  const status = document.createElement('small');
  status.textContent = state.marketStatus || 'Live if available';
  header.append(title, status);
  els.statGrid.appendChild(header);

  const list = document.createElement('div');
  list.className = 'market-list';
  const rows = state.marketBoard?.items?.length ? state.marketBoard.items : MARKET_QUOTES.map(item => ({ ...item, quote: null, index: null }));

  rows.forEach(item => {
    const quote = item.quote;
    const index = item.index;
    const changeValue = quote?.changePercent;
    const changeClass = Number(changeValue) > 0 ? 'up' : Number(changeValue) < 0 ? 'down' : 'flat';
    const row = document.createElement('div');
    row.className = `market-row ${quote ? '' : 'loading'}`.trim();
    row.innerHTML = `
      <div class="market-name">
        <strong></strong>
        <span></span>
      </div>
      <div class="market-price">
        <strong></strong>
        <span class="market-change ${changeClass}"></span>
      </div>
      <div class="market-index">
        <span></span>
        <strong></strong>
      </div>
    `;
    row.querySelector('.market-name strong').textContent = item.company;
    row.querySelector('.market-name span').textContent = `${item.market}: ${item.symbol}`;
    row.querySelector('.market-price strong').textContent = quote ? formatMarketNumber(quote.price, quote.currency) : '--';
    row.querySelector('.market-change').textContent = quote ? formatMarketChange(quote.change, quote.changePercent) : (state.marketStatus === 'Loading market data' ? 'Loading' : 'Unavailable');
    row.querySelector('.market-index span').textContent = item.indexLabel;
    row.querySelector('.market-index strong').textContent = index ? `${formatMarketNumber(index.price)} (${formatMarketChange(index.change, index.changePercent)})` : '--';
    list.appendChild(row);
  });

  els.statGrid.appendChild(list);
}
function topStoryForRegion(regionId) {
  const targetRegionId = regionId === 'all' ? 'singapore' : regionId;
  const region = allRegions().find(item => item.id === targetRegionId);
  const articles = (region?.articles || [])
    .filter(article => article && article.title)
    .slice()
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  if (!articles.length) return null;
  return { ...articles[0], region };
}

function leadStoryForActiveRegion() {
  const regionalLead = topStoryForRegion(state.activeRegion);
  if (regionalLead) return regionalLead;

  const singaporeLead = topStoryForRegion('singapore');
  if (singaporeLead) return singaporeLead;

  return allStories().sort((a, b) => (b.score || 0) - (a.score || 0))[0] || null;
}

function renderLead() {
  const lead = leadStoryForActiveRegion();
  els.leadStory.className = 'lead-card';
  if (!lead) {
    els.leadStory.className = 'lead-card empty';
    els.leadStory.textContent = 'No stories loaded yet.';
    return;
  }
  els.leadStory.innerHTML = '';
  const region = document.createElement('span');
  region.className = 'lead-region';
  region.textContent = `${lead.region.label} / ${lead.source || 'Source'}`;
  const title = document.createElement('h3');
  title.textContent = lead.title;
  const summary = document.createElement('p');
  summary.textContent = lead.summary || 'No summary available.';
  const link = document.createElement('a');
  link.href = lead.url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = 'Read top story';
  els.leadStory.append(region, title, summary, link);
}
function renderCoverage() {
  els.coverageList.innerHTML = '';
  allRegions().forEach(region => {
    const li = document.createElement('li');
    if (state.activeRegion === region.id) li.className = 'active';
    li.innerHTML = '<span></span><b></b>';
    li.querySelector('span').textContent = region.label;
    li.querySelector('b').textContent = (region.articles || []).length;
    els.coverageList.appendChild(li);
  });

  els.tagCloud.innerHTML = '';
  TAGS.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    els.tagCloud.appendChild(span);
  });
}

function renderRegions() {
  els.regionFeed.innerHTML = '';
  const regions = filteredRegions();
  if (!regions.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No matching stories in the current view.';
    els.regionFeed.appendChild(empty);
    return;
  }

  regions.forEach(region => {
    const block = document.createElement('section');
    block.className = 'region-block';
    const header = document.createElement('div');
    header.className = 'region-header';
    const left = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = region.label;
    const p = document.createElement('p');
    p.textContent = region.company ? `${region.company} intelligence stream` : 'Regional intelligence stream';
    left.append(h2, p);
    const count = document.createElement('span');
    count.className = 'tag';
    count.textContent = `${(region.articles || []).length} stories`;
    header.append(left, count);

    const grid = document.createElement('div');
    grid.className = 'story-grid';
    if (!region.articles || !region.articles.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = region.error || 'No stories found in this scan window.';
      grid.appendChild(empty);
    } else {
      region.articles.forEach((article, index) => grid.appendChild(renderStory(article, index === 0)));
    }
    block.append(header, grid);
    els.regionFeed.appendChild(block);
  });
}

function renderStory(article, major) {
  const node = els.storyTemplate.content.firstElementChild.cloneNode(true);
  if (major) node.classList.add('major');
  node.querySelector('.story-meta').textContent = `${article.source || 'Source'} / ${formatShortDate(article.publishedAt)}`;
  node.querySelector('h3').textContent = article.title || 'Untitled story';
  node.querySelector('p').textContent = article.summary || 'No summary available.';
  const link = node.querySelector('a');
  link.href = article.url || '#';
  return node;
}

function render() {
  if (!state.report) {
    renderEmptyShell();
    return;
  }
  els.lastUpdated.textContent = formatDate(state.report.generatedAt);
  els.heroStandfirst.textContent = state.report.summary || 'Latest regional market intelligence is ready.';
  renderTabs();
  renderStats();
  renderLead();
  renderCoverage();
  renderRegions();
  syncScanButtonState();
}

function renderEmptyShell() {
  els.lastUpdated.textContent = 'No report yet';
  els.heroStandfirst.textContent = 'Run a weekly scan to populate major headlines across Ithaca, Optus, Telkomsel, AIS, Airtel, and Globe.';
  els.regionTabs.innerHTML = '';
  renderStats();
  els.coverageList.innerHTML = '';
  els.tagCloud.innerHTML = '';
  els.leadStory.className = 'lead-card empty';
  els.leadStory.textContent = 'Awaiting first scan.';
  els.regionFeed.innerHTML = '<div class="empty-state">No market pulse report has been loaded.</div>';
  syncScanButtonState();
}

function saveLocalReport(report) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(report)); } catch {}
}

function loadLocalReport() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const report = raw ? JSON.parse(raw) : null;
    if (!report || report.scanVersion !== SCAN_VERSION) return null;
    const normalized = normalizeReport(report);
    applyReportMarketSnapshot(normalized);
    return normalized;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const timeoutController = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, ms);
  const signal = combineAbortSignals([options.signal, timeoutController.signal]);
  try {
    return await fetch(url, { ...options, signal });
  } catch (error) {
    if (timedOut && !options.signal?.aborted && isAbortError(error)) {
      throw new Error(`Request timed out after ${Math.round(ms / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function backendBaseUrl() {
  return window.location.protocol === 'file:' ? LOCAL_BACKEND_ORIGIN : '';
}

async function fetchBackendReport(days, signal) {
  const baseUrl = backendBaseUrl();
  const url = `${baseUrl}/api/research?window=${encodeURIComponent(days)}`;
  const response = await fetchWithTimeout(url, { cache: 'no-store', signal }, BACKEND_SCAN_TIMEOUT_MS);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loadLatest() {
  const local = loadLocalReport();
  if (local) {
    state.report = local;
    setStatus('Ready');
    render();
    return;
  }
  if (window.location.protocol === 'file:') {
    state.report = null;
    setStatus('Ready');
    renderEmptyShell();
    return;
  }
  try {
    setStatus('Loading latest saved report');
    const response = await fetchWithTimeout('/api/latest', {}, 5000);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let payload = await response.json();
    if (payload.status === 'empty' || payload.scanVersion !== SCAN_VERSION) {
      state.report = null;
      setStatus('Ready');
      renderEmptyShell();
      return;
    }
    payload = normalizeReport(payload);
    state.report = payload;
    applyReportMarketSnapshot(payload);
    saveLocalReport(payload);
    setStatus('Ready');
    render();
  } catch {
    state.report = null;
    setStatus('Ready');
    renderEmptyShell();
  }
}

async function runScan() {
  if (scanIsRunning()) {
    stopActiveScan();
    return;
  }
  if (state.loading) return;

  const days = els.windowSelect.value || '7';
  const controller = new AbortController();
  activeScanController = controller;
  let stopEstimatedProgress = null;

  try {
    setStatus('Refreshing in background', true);
    setScanProgress({ percent: 0, label: 'Preparing background refresh...' });
    const marketSnapshotPromise = loadMarketBoard({ capture: true, signal: controller.signal })
      .catch(error => {
        if (isAbortError(error)) return null;
        throw error;
      });
    let payload = null;

    try {
      stopEstimatedProgress = startEstimatedScanProgress(controller.signal);
      setScanProgress({ percent: 1, label: 'Background refresh running - safe to switch tabs' });
      payload = await fetchBackendReport(days, controller.signal);
      throwIfAborted(controller.signal);
      if (stopEstimatedProgress) {
        stopEstimatedProgress();
        stopEstimatedProgress = null;
      }
      setScanProgress({ percent: 100, label: '100% - Background scan complete' });
    } catch (backendError) {
      if (isAbortError(backendError)) throw backendError;
      if (stopEstimatedProgress) {
        stopEstimatedProgress();
        stopEstimatedProgress = null;
      }
      setStatus('Browser fallback running', true);
      setScanProgress({
        percent: 0,
        label: `Local backend unavailable (${backendError.message}). Keeping browser scan running...`
      });
      payload = await runClientScan(Number(days), setScanProgress, controller.signal);
    }

    throwIfAborted(controller.signal);
    const marketSnapshot = await marketSnapshotPromise;
    throwIfAborted(controller.signal);
    payload = normalizeReport({ ...payload, marketSnapshot });
    state.report = payload;
    saveLocalReport(payload);
    if (activeScanController === controller) activeScanController = null;
    setStatus('Refresh complete');
    setScanProgress({ percent: 100, label: '100% - Refresh complete' });
    render();
  } catch (error) {
    if (activeScanController === controller) activeScanController = null;
    if (isAbortError(error)) {
      setStatus('Refresh stopped');
      setScanProgress({ ...state.scanProgressDetail, label: 'Refresh stopped' });
      if (!state.report) renderEmptyShell();
      return;
    }
    setStatus('Refresh failed');
    setScanProgress({ percent: 0, label: 'Refresh failed' });
    if (state.report) render();
    else renderEmptyShell();
    const note = document.createElement('div');
    note.className = 'error-note';
    note.textContent = `Unable to run scan: ${error.message}`;
    els.leadStory.appendChild(note);
  } finally {
    if (stopEstimatedProgress) stopEstimatedProgress();
    if (activeScanController === controller) activeScanController = null;
  }
}
async function runClientScan(days, onProgress, signal) {
  throwIfAborted(signal);
  const totalSearches = totalScanSearches();
  let completed = 0;
  const startedAt = Date.now();

  const markSearchComplete = (region, increment = 1) => {
    if (signal?.aborted) return;
    const step = Math.max(1, Number(increment) || 1);
    completed = Math.min(totalSearches, completed + step);
    if (typeof onProgress !== 'function') return;
    const elapsed = Date.now() - startedAt;
    const etaMs = completed > 0 ? (elapsed / completed) * Math.max(totalSearches - completed, 0) : null;
    onProgress({
      completed,
      total: totalSearches,
      etaMs,
      label: `${Math.round((completed / totalSearches) * 100)}% - ${completed}/${totalSearches} searches resolved - ${region.shortLabel || region.label}${formatEta(etaMs) ? ` - ${formatEta(etaMs)}` : ''}`
    });
  };

  if (typeof onProgress === 'function') {
    onProgress({ completed: 0, total: totalSearches, label: `Starting scan - 0/${totalSearches} searches queued` });
  }

  const scannedRegions = await Promise.all(REGIONS.map(region => scanRegion(region, days, markSearchComplete, signal)));
  const regions = dedupeReportRegions(scannedRegions);
  const storyCount = regions.reduce((sum, region) => sum + (region.articles || []).length, 0);
  return {
    title: 'Ithaca Group Market Pulse',
    generatedAt: new Date().toISOString(),
    windowDays: days,
    source: 'Google/Bing News RSS plus telco source-targeted queries via browser proxy',
    scanVersion: SCAN_VERSION,
    summary: `Weekly scan completed across ${REGIONS.length} markets with ${storyCount} stories in the last ${days} days.`,
    regions
  };
}
async function scanRegion(region, days, onSearchComplete, signal) {
  throwIfAborted(signal);
  const queries = buildRegionQueries(region);
  const directPages = directSourcePagesForRegion(region.id);
  const totalRegionSearches = queries.length + directPages.length;
  const cutoff = Date.now() - Number(days) * 86400000;
  const seen = new Set();
  const articles = [];
  const errors = [];
  let completedSearches = 0;

  const hasEnoughArticles = () => articles.length >= REGION_ARTICLE_TARGET;
  const canAcceptMore = () => articles.length < REGION_ARTICLE_LIMIT;
  const markSearchComplete = (count = 1) => {
    const step = Math.max(1, Number(count) || 1);
    completedSearches = Math.min(totalRegionSearches, completedSearches + step);
    if (typeof onSearchComplete === 'function') onSearchComplete(region, step);
  };
  const markSkippedRemaining = () => {
    const remaining = totalRegionSearches - completedSearches;
    if (remaining > 0) markSearchComplete(remaining);
  };

  for (const term of queries) {
    throwIfAborted(signal);
    if (hasEnoughArticles()) {
      markSkippedRemaining();
      break;
    }

    let termMatched = false;
    const termErrors = [];
    for (const rssUrl of buildNewsFeedUrls(term)) {
      throwIfAborted(signal);
      if (!canAcceptMore()) break;
      try {
        const xmlText = await fetchRssWithProxy(rssUrl, signal);
        const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
        const items = Array.from(doc.querySelectorAll('item'));
        for (const item of items) {
          const rawTitle = stripHtml(readItemText(item, ['title']));
          if (!rawTitle) continue;
          const rawDate = readItemText(item, ['pubDate', 'published', 'updated']) || Date.now();
          const published = new Date(rawDate);
          const publishedTime = published.getTime();
          if (!Number.isNaN(publishedTime) && publishedTime < cutoff) continue;
          const source = readItemText(item, ['source', 'publisher', 'dc\\:creator']) || sourceFromTitle(rawTitle) || 'News RSS';
          const title = cleanArticleTitle(rawTitle, source);
          const url = readItemText(item, ['link', 'guid']) || rssUrl;
          const keys = [articleKey({ title, url }), urlKey(url)].filter(Boolean);
          if (!keys.length || keys.some(key => seen.has(key))) continue;
          const summary = stripHtml(readItemText(item, ['description', 'summary', 'content'])).slice(0, 260);
          const publishedAt = Number.isNaN(publishedTime) ? new Date().toISOString() : published.toISOString();
          const article = {
            title,
            summary: summary.length >= 260 ? `${summary.slice(0, 257).trim()}...` : summary,
            source,
            url,
            publishedAt,
            score: scoreStory(title, summary, publishedAt)
          };
          if (!isTelcoRelevantArticle(article, region)) continue;
          keys.forEach(key => seen.add(key));
          articles.push(article);
          termMatched = true;
          if (!canAcceptMore()) break;
        }
        if (termMatched || !canAcceptMore()) break;
      } catch (error) {
        if (isAbortError(error)) throw error;
        termErrors.push(error.message);
      }
    }

    if (!termMatched) {
      errors.push(termErrors.length ? `${term}: ${termErrors.join('; ')}` : `${term}: no recent stories from available feeds`);
    }
    markSearchComplete();
  }

  if (!hasEnoughArticles()) {
    for (const page of directPages) {
      throwIfAborted(signal);
      if (hasEnoughArticles()) {
        markSkippedRemaining();
        break;
      }
      try {
        const html = await fetchTextWithProxy(page.url, text => /<html|<a\s/i.test(text), 'HTML', signal, DIRECT_SOURCE_TIMEOUT_MS);
        const directArticles = extractDirectSourceArticles(page, html, region);
        directArticles.forEach(article => {
          if (!canAcceptMore()) return;
          const keys = [articleKey(article), urlKey(article.url)].filter(Boolean);
          if (!keys.length || keys.some(key => seen.has(key))) return;
          keys.forEach(key => seen.add(key));
          articles.push(article);
        });
      } catch (error) {
        if (isAbortError(error)) throw error;
        errors.push(`${page.source || page.url}: ${error.message}`);
      }
      markSearchComplete();
    }
  } else {
    markSkippedRemaining();
  }

  return {
    id: region.id,
    label: region.label,
    shortLabel: region.shortLabel,
    company: region.company,
    queries,
    articles: articles.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, REGION_ARTICLE_LIMIT),
    error: !articles.length && errors.length ? 'News source rejected this regional scan. Try again or widen the scan window.' : null,
    diagnostics: errors
  };
}

async function fetchTextWithProxy(targetUrl, validateText, label = 'source', signal, timeoutMs = 12000) {
  const urls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, { signal }, timeoutMs);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (typeof validateText === 'function' && !validateText(text)) throw new Error(`Proxy returned non-${label} content`);
      return text;
    } catch (error) {
      if (isAbortError(error)) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error(`${label} proxy failed`);
}

async function fetchRssWithProxy(rssUrl, signal) {
  return fetchTextWithProxy(rssUrl, text => text.includes('<rss') || text.includes('<feed'), 'RSS', signal, RSS_FETCH_TIMEOUT_MS);
}

function exportReport() {
  if (!state.report) return;
  const blob = new Blob([JSON.stringify(state.report, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `ithaca-group-market-pulse-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

els.themeButtons.forEach(button => {
  button.addEventListener('click', () => applyTheme(button.dataset.themeOption));
});
els.scanBtn.addEventListener('click', runScan);
els.exportBtn.addEventListener('click', exportReport);
els.printBtn.addEventListener('click', () => window.print());
els.searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  renderRegions();
  syncScanButtonState();
});

async function init() {
  applyTheme(loadTheme());
  await loadLatest();
  loadMarketBoard();
}

init();







































































