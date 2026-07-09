const QUOTE_TIMEOUT_MS = 6000;
const USER_AGENT = 'Mozilla/5.0 IthacaGroupMarketPulse/1.0';

const MARKET_QUOTES = [
  { company: 'Singtel', symbol: 'Z74.SI', market: 'SGX', indexLabel: 'STI', indexSymbol: '^STI' },
  { company: 'Bharti Airtel', symbol: 'BHARTIARTL.NS', market: 'NSE', indexLabel: 'Nifty 50', indexSymbol: '^NSEI' },
  { company: 'AIS', symbol: 'ADVANC.BK', market: 'SET', indexLabel: 'SET Index', indexSymbol: '^SET.BK' },
  { company: 'Globe Telecom', symbol: 'GLO.PS', market: 'PSE', indexLabel: 'PSEi', indexSymbol: 'PSEI.PS' },
  { company: 'Telkom Indonesia', symbol: 'TLKM.JK', market: 'IDX', indexLabel: 'JCI', indexSymbol: '^JKSE' },
  { company: 'Optus parent', symbol: 'Z74.SI', market: 'SGX', indexLabel: 'ASX 200', indexSymbol: '^AXJO' }
];

const JSON_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type',
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8'
};

export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    return jsonResponse(await runMarketBoard());
  } catch (error) {
    return jsonResponse({ error: error.message || 'Market board failed' }, 500);
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json, */*', 'user-agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchYahooQuote(symbol) {
  const encoded = encodeURIComponent(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=1m`;
  const json = JSON.parse(await fetchText(url, QUOTE_TIMEOUT_MS));
  const meta = json?.chart?.result?.[0]?.meta;
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
    source: 'Yahoo Finance chart feed via Cloudflare Pages Functions',
    items
  };
}
