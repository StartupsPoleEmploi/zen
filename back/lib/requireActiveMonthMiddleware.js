module.exports = (req, res, next) => {
  if (!req.activeMonth) {
    return res.status(503).json('Service unavailable (no active month)')
  }
  next()
}
