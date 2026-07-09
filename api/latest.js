const {
  handleOptions,
  readBundledLatestReport,
  sendJson
} = require('./_shared');

module.exports = function latestHandler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method && req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  return sendJson(res, 200, readBundledLatestReport());
};
