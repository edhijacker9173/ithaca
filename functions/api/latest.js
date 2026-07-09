const JSON_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type',
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8'
};

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const assetUrl = new URL('/data/latest-report.json', request.url);
    const response = env?.ASSETS ? await env.ASSETS.fetch(assetUrl.toString()) : null;
    if (!response || !response.ok) return jsonResponse({ status: 'empty' });
    return new Response(await response.text(), { status: 200, headers: JSON_HEADERS });
  } catch (error) {
    return jsonResponse({ status: 'empty', error: error.message });
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}
