const {
  handleOptions,
  runMarketBoard,
  sendJson
} = require('./_shared');

module.exports = async function marketsHandler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method && req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const board = await runMarketBoard();
    return sendJson(res, 200, board);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Market board failed' });
  }
};

module.exports.config = { maxDuration: 30 };
