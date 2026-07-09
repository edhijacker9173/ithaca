const {
  clampWindowDays,
  handleOptions,
  queryValue,
  runMarketScan,
  sendJson
} = require('./_shared');

module.exports = async function researchHandler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method && req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const windowDays = clampWindowDays(queryValue(req, 'window', '7'));
    const report = await runMarketScan(windowDays);
    return sendJson(res, 200, report);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Research scan failed' });
  }
};

module.exports.config = { maxDuration: 60 };
