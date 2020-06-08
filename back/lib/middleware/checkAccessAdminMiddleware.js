const checkAccessAdmin = (permission) => (req, res, next) => {
  if (!req.session || !req.session.useradmin) {
    return res.send(401);
  } else if (!permission.includes(req.session.useradmin.type)) {
    return res.send(403);
  }
  next();
}

const checkLogin = checkAccessAdmin(['admin', 'viewer'])
const checkAdmin = checkAccessAdmin(['admin'])

module.exports = {
  checkLogin,
  checkAdmin,
}
