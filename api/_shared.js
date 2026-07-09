const fs = require('fs');
const path = require('path');

const SCAN_VERSION = 5;
const REGION_ARTICLE_TARGET = 12;
const REGION_ARTICLE_LIMIT = 18;
const FEED_TIMEOUT_MS = 10000;
const DIRECT_SOURCE_TIMEOUT_MS = 12000;
const QUOTE_TIMEOUT_MS = 6000;
const USER_AGENT = 'Mozilla/5.0 IthacaGroupMarketPulse/1.0';

const REGIONS = [
  { id: 'group', label: 'Group / Regional', shortLabel: 'Group', company: 'Ithaca Group, NCS, Nxera', queries: ['Ithaca', '"Ithaca Group"', 'NCS Singapore', 'Nxera Ithaca', '"Ithaca AI"', '"Ithaca data centre"'] },
  { id: 'singapore', label: 'Singapore', shortLabel: 'Singapore', company: 'Ithaca', queries: ['Ithaca', '"Ithaca Communications"', '"Ithaca Singapore"', '"Ithaca 5G"', '"Ithaca AI"'] },
  { id: 'indonesia', label: 'Indonesia', shortLabel: 'Indonesia', company: 'Telkomsel', queries: ['Telkomsel', '"Telkomsel AI"', '"Telkomsel 5G"', '"Telkomsel data centre"'] },
  { id: 'thailand', label: 'Thailand', shortLabel: 'Thailand', company: 'AIS / Advanced Info Service', queries: ['"Advanced Info Service"', '"AIS Thailand"', '"AIS 5G"', '"AIS telecom"'] },
  { id: 'india', label: 'India', shortLabel: 'India', company: 'Bharti Airtel', queries: ['"Bharti Airtel"', '"Airtel India"', '"Airtel AI"', '"Airtel 5G"', '"Airtel data centre"'] },
  { id: 'philippines', label: 'Philippines', shortLabel: 'Philippines', company: 'Globe Telecom', queries: ['"Globe Telecom"', '"Globe Telecom Philippines"', '"Globe Telecom 5G"', '"Globe Telecom AI"', '"Globe Telecom network"', '"Globe Telecom earnings"'] },
  { id: 'australia', label: 'Australia', shortLabel: 'Australia', company: 'Optus', queries: ['Optus', '"Ithaca Optus"', '"Optus AI"', '"Optus 5G"', '"Optus outage"', '"Optus network"'] }
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

const REGION_SOURCE_SEARCH_PHRASES = {
  group: 'Ithaca',
  singapore: 'Ithaca',
  indonesia: 'Telkomsel',
  thailand: '"AIS Thailand"',
  india: '"Bharti Airtel"',
  philippines: '"Globe Telecom"',
  australia: 'Optus'
};

const DIRECT_SOURCE_PAGES = {
  singapore: [
    { source: 'Singapore Business Review', url: 'https://sbr.com.sg/telecom-internet' },
    { source: 'HardwareZone', url: 'https://www.hardwarezone.com.sg/mobile/telco' }
  ]
};

const MARKET_QUOTES = [
  { company: 'Singtel', symbol: 'Z74.SI', market: 'SGX', indexLabel: 'STI', indexSymbol: '^STI' },
  { company: 'Bharti Airtel', symbol: 'BHARTIARTL.NS', market: 'NSE', indexLabel: 'Nifty 50', indexSymbol: '^NSEI' },
  { company: 'AIS', symbol: 'ADVANC.BK', market: 'SET', indexLabel: 'SET Index', indexSymbol: '^SET.BK' },
  { company: 'Globe Telecom', symbol: 'GLO.PS', market: 'PSE', indexLabel: 'PSEi', indexSymbol: 'PSEI.PS' },
  { company: 'Telkom Indonesia', symbol: 'TLKM.JK', market: 'IDX', indexLabel: 'JCI', indexSymbol: '^JKSE' },
  { company: 'Optus parent', symbol: 'Z74.SI', market: 'SGX', indexLabel: 'ASX 200', indexSymbol: '^AXJO' }
];

function sendJson(res, statusCode, payload) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function handleOptions(req, res) {
  if (req.method !== 'OPTIONS') return false;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.statusCode = 204;
  res.end('');
  return true;
}

function queryValue(req, name, fallback = '') {
  const raw = req.query && req.query[name];
  if (Array.isArray(raw)) return raw[0] || fallback;
  if (raw !== undefined && raw !== null && raw !== '') return String(raw);
  try {
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
    return url.searchParams.get(name) || fallback;
  } catch {
    return fallback;
  }
}

function clampWindowDays(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 7;
  return Math.min(parsed, 45);
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        'user-agent': USER_AGENT
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeHtml(value = '') {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (_, key) => named[key.toLowerCase()] || `&${key};`);
}

function stripHtml(value = '') {
  return decodeHtml(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeComparableText(value = '') {
  return stripHtml(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .toLowerCase()
    .replace(/\b(us|s|sgd|usd|php|idr|inr|thb)\$?/g, ' ')
    .replace(/\$|s\$|us\$/g, ' ')
    .replace(/[^a-z0-9.%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceSearchPhrase(region) {
  return REGION_SOURCE_SEARCH_PHRASES[region.id] || region.company || region.label;
}

function buildRegionQueries(region) {
  const baseQueries = region.queries || [];
  const domains = REGION_TELCO_SOURCE_DOMAINS[region.id] || ['telecoms.com', 'lightreading.com', 'telecompaper.com', 'developingtelecoms.com'];
  const sourceQueries = domains.map(domain => `${sourceSearchPhrase(region)} site:${domain}`);
  return Array.from(new Set([...baseQueries, ...sourceQueries]));
}

function buildNewsFeedUrls(term) {
  const encoded = encodeURIComponent(term);
  return [
    `https://news.google.com/rss/search?q=${encoded}&hl=en-SG&gl=SG&ceid=SG:en`,
    `https://www.bing.com/news/search?q=${encoded}&format=rss`
  ];
}

function tagText(xml, tag) {
  const match = String(xml).match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
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

function parseRssItems(xml, fallbackUrl) {
  const items = [];
  const blocks = String(xml).match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const rawTitle = tagText(block, 'title');
    if (!rawTitle) continue;
    const source = tagText(block, 'source') || tagText(block, 'publisher') || tagText(block, 'dc:creator') || sourceFromTitle(rawTitle) || 'News RSS';
    const title = cleanArticleTitle(rawTitle, source);
    const url = tagText(block, 'link') || tagText(block, 'guid') || fallbackUrl;
    const summary = stripHtml(tagText(block, 'description') || tagText(block, 'summary') || tagText(block, 'content')).slice(0, 260);
    const rawDate = tagText(block, 'pubDate') || tagText(block, 'published') || tagText(block, 'updated');
    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
    items.push({ title, source, url, summary, publishedAt });
  }
  return items;
}

const TELCO_CONTEXT_PATTERN = /\b(telco|telecom|telecommunications|mobile|wireless|5g|4g|broadband|fibre|fiber|network|spectrum|operator|carrier|subscriber|data centre|data center|datacentre|datacenter|cloud|cyber|security|tower|roaming|prepaid|postpaid|sim|esim|outage|disruption|service|coverage|earnings|revenue|profit|capex|shares|stock|market|ceo|chief executive|regulator|regulation|license|licence|partnership|collaboration|digital bank|fintech|gomo|ncs|nxera)\b/i;
const OUT_OF_CONTEXT_PATTERN = /\b(miss globe|miss universe|beauty pageant|beauty contest|pageant|crown|contestant|candidate|swimsuit|national costume|golden globe|golden globes|globe theatre|globe soccer|globe life|globe and mail|boston globe)\b/i;

function hasTelcoContext(text) {
  return TELCO_CONTEXT_PATTERN.test(text);
}

function sourceLooksTelco(source) {
  return /\b(telecoms|telecompaper|telecomlead|telecomtv|telecom review|light reading|rcr wireless|total telecom|capacity media|developing telecoms|asian telecom|channel newsasia|cna|business times|straits times|singapore business review|hardwarezone)\b/.test(normalizeComparableText(source || ''));
}

function regionCompanyMention(text, region) {
  const normalized = normalizeComparableText(text);
  switch (region.id) {
    case 'group': return /\b(ithaca|ithaca communications|ncs|nxera)\b/.test(normalized);
    case 'singapore': return /\b(ithaca|ithaca communications)\b/.test(normalized);
    case 'indonesia': return /\b(telkomsel|telkom indonesia|tlkm)\b/.test(normalized);
    case 'thailand': return /\b(advanced info service|ais thailand|advanc)\b/.test(normalized) || (/\bais\b/.test(normalized) && hasTelcoContext(normalized));
    case 'india': return /\b(bharti airtel|airtel)\b/.test(normalized);
    case 'philippines': return /\b(globe telecom|globe group|globe business|globe at home|glo ps)\b/.test(normalized) || (/\bglobe\b/.test(normalized) && hasTelcoContext(normalized));
    case 'australia': return /\b(optus|ithaca optus)\b/.test(normalized);
    default: return true;
  }
}

function isTelcoRelevantArticle(article, region) {
  const combined = `${article.title || ''} ${article.summary || ''} ${article.source || ''}`;
  const normalized = normalizeComparableText(combined);
  if (!normalized || OUT_OF_CONTEXT_PATTERN.test(normalized)) return false;
  if (!regionCompanyMention(normalized, region)) return false;
  return hasTelcoContext(normalized) || sourceLooksTelco(article.source);
}

function scoreStory(title, summary, publishedAt) {
  const text = `${title} ${summary}`;
  const age = Date.now() - new Date(publishedAt).getTime();
  let score = 20;
  if (/\bAI\b|artificial intelligence|generative AI|GenAI|Nvidia|GPU/i.test(text)) score += 28;
  if (/5G|network|spectrum|cloud|data centre|datacenter|cyber|security/i.test(text)) score += 18;
  if (/earnings|results|profit|revenue|guidance|capex|investment|partnership|launch|regulator|license/i.test(text)) score += 16;
  if (age < 2 * 86400000) score += 12;
  else if (age < 7 * 86400000) score += 6;
  return score;
}

function articleKey(article) {
  return normalizeComparableText(article.title || article.url || '').replace(/\s+/g, '');
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

function resolveSourceUrl(baseUrl, href) {
  if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return '';
  try {
    return new URL(decodeHtml(href).trim(), baseUrl).href;
  } catch {
    return '';
  }
}

function extractDirectSourceArticles(page, html, region) {
  const articles = [];
  const seen = new Set();
  const linkPattern = /<a\s+[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkPattern.exec(html))) {
    const title = stripHtml(match[3]);
    if (title.length < 18 || title.length > 180) continue;
    const url = resolveSourceUrl(page.url, match[2]);
    const key = urlKey(url);
    if (!url || seen.has(key)) continue;
    seen.add(key);
    const summary = `Direct listing from ${page.source}.`;
    const article = {
      title,
      summary,
      source: page.source,
      url,
      publishedAt: new Date().toISOString(),
      score: scoreStory(title, summary, new Date()) + 6
    };
    if (isTelcoRelevantArticle(article, region)) articles.push(article);
    if (articles.length >= REGION_ARTICLE_LIMIT) break;
  }
  return articles;
}

async function scanRegion(region, days) {
  const cutoff = Date.now() - days * 86400000;
  const queries = buildRegionQueries(region);
  const articles = [];
  const errors = [];
  const seen = new Set();

  for (const term of queries) {
    if (articles.length >= REGION_ARTICLE_TARGET) break;
    let matched = false;
    const termErrors = [];
    for (const feedUrl of buildNewsFeedUrls(term)) {
      if (articles.length >= REGION_ARTICLE_LIMIT) break;
      try {
        const xml = await fetchText(feedUrl, FEED_TIMEOUT_MS);
        for (const item of parseRssItems(xml, feedUrl)) {
          const publishedTime = new Date(item.publishedAt).getTime();
          if (!Number.isNaN(publishedTime) && publishedTime < cutoff) continue;
          const article = {
            ...item,
            summary: item.summary.length >= 260 ? `${item.summary.slice(0, 257).trim()}...` : item.summary,
            score: scoreStory(item.title, item.summary, item.publishedAt)
          };
          const keys = [articleKey(article), urlKey(article.url)].filter(Boolean);
          if (!keys.length || keys.some(key => seen.has(key))) continue;
          if (!isTelcoRelevantArticle(article, region)) continue;
          keys.forEach(key => seen.add(key));
          articles.push(article);
          matched = true;
          if (articles.length >= REGION_ARTICLE_LIMIT) break;
        }
        if (matched) break;
      } catch (error) {
        termErrors.push(error.message);
      }
    }
    if (!matched) errors.push(termErrors.length ? `${term}: ${termErrors.join('; ')}` : `${term}: no recent stories`);
  }

  if (articles.length < REGION_ARTICLE_TARGET) {
    for (const page of DIRECT_SOURCE_PAGES[region.id] || []) {
      if (articles.length >= REGION_ARTICLE_TARGET) break;
      try {
        const html = await fetchText(page.url, DIRECT_SOURCE_TIMEOUT_MS);
        for (const article of extractDirectSourceArticles(page, html, region)) {
          const keys = [articleKey(article), urlKey(article.url)].filter(Boolean);
          if (!keys.length || keys.some(key => seen.has(key))) continue;
          keys.forEach(key => seen.add(key));
          articles.push(article);
          if (articles.length >= REGION_ARTICLE_LIMIT) break;
        }
      } catch (error) {
        errors.push(`${page.source}: ${error.message}`);
      }
    }
  }

  articles.sort((a, b) => (b.score || 0) - (a.score || 0));
  return {
    id: region.id,
    label: region.label,
    shortLabel: region.shortLabel,
    company: region.company,
    queries,
    query: queries.join(' | '),
    articles: articles.slice(0, REGION_ARTICLE_LIMIT),
    error: !articles.length && errors.length ? 'News source rejected this regional scan. Try again or widen the scan window.' : null,
    diagnostics: errors.slice(0, 8)
  };
}

function dedupeReportRegions(regions) {
  const seen = new Set();
  return regions.map(region => {
    const articles = [];
    for (const article of region.articles || []) {
      const key = articleKey(article) || urlKey(article.url);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      articles.push(article);
      if (articles.length >= 8) break;
    }
    return { ...region, articles, error: articles.length ? null : region.error };
  });
}

async function runMarketScan(windowDays) {
  const regions = dedupeReportRegions(await Promise.all(REGIONS.map(region => scanRegion(region, windowDays))));
  const storyCount = regions.reduce((sum, region) => sum + (region.articles || []).length, 0);
  return {
    title: 'Ithaca Group Market Pulse',
    generatedAt: new Date().toISOString(),
    windowDays,
    source: 'Google/Bing News RSS plus telco source-targeted queries via API research',
    articlePullMethod: 'API research',
    scanVersion: SCAN_VERSION,
    summary: `Weekly scan completed across ${REGIONS.length} markets with ${storyCount} stories in the last ${windowDays} days.`,
    regions
  };
}

async function fetchYahooQuote(symbol) {
  const encoded = encodeURIComponent(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=1m`;
  const json = JSON.parse(await fetchText(url, QUOTE_TIMEOUT_MS));
  const meta = json && json.chart && json.chart.result && json.chart.result[0] && json.chart.result[0].meta;
  if (!meta) throw new Error(`No quote data for ${symbol}`);
  const price = Number(meta.regularMarketPrice ?? meta.previousClose);
  const previousClose = Number(meta.previousClose);
  const change = Number.isFinite(price) && Number.isFinite(previousClose) ? price - previousClose : null;
  const changePercent = Number.isFinite(change) && previousClose ? (change / previousClose) * 100 : null;
  return {
    symbol,
    price: Number.isFinite(price) ? price : null,
    previousClose: Number.isFinite(previousClose) ? previousClose : null,
    change,
    changePercent,
    currency: meta.currency || '',
    exchange: meta.exchangeName || meta.fullExchangeName || '',
    asOf: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString()
  };
}

async function runMarketBoard() {
  const items = await Promise.all(MARKET_QUOTES.map(async item => {
    const [quote, index] = await Promise.allSettled([
      fetchYahooQuote(item.symbol),
      fetchYahooQuote(item.indexSymbol)
    ]);
    return {
      ...item,
      quote: quote.status === 'fulfilled' ? quote.value : null,
      index: index.status === 'fulfilled' ? index.value : null
    };
  }));
  return {
    generatedAt: new Date().toISOString(),
    source: 'Yahoo Finance chart feed via API research',
    items
  };
}

function readBundledLatestReport() {
  const latestPath = path.join(process.cwd(), 'data', 'latest-report.json');
  if (!fs.existsSync(latestPath)) return { status: 'empty' };
  try {
    return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  } catch (error) {
    return { status: 'empty', error: error.message };
  }
}

module.exports = {
  SCAN_VERSION,
  clampWindowDays,
  handleOptions,
  queryValue,
  readBundledLatestReport,
  runMarketBoard,
  runMarketScan,
  sendJson
};
