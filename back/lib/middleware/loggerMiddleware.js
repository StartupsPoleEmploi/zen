
const winston = require('../log')

function getip (req) {
  return req.ip || 
    (req.connection && req.connection.remoteAddress) ||
    undefined
}

function log({ req, res, startTime }) {
  const type = res.statusCode >= 200 && res.statusCode <= 500 ? 'info' : 'error';

  winston[type](`${req.method} ${req.path} [${res.statusCode}] - ${Date.now() - startTime}ms`, {
    ip : getip(req),
    origin: req.headers.referer,
    userAgent: req.headers['user-agent'],
    userId: req.user && req.user.id,
  })
}

async function loggerMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => log({ req, res, startTime }));

  next();
}

module.exports = loggerMiddleware;