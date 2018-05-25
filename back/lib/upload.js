const multer = require('multer')
const path = require('path')

const uploadDestination =
  process.env.NODE_ENV === 'production' ? 'uploads/' : '/tmp/uploads/'

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb) {
      path.extname(file.originalname)
      cb(
        null,
        `${req.session.user.id}-${Date.now()}-${path.extname(
          file.originalname,
        )}`,
      )
    },
  }),
  fileFilter: function(req, file, callback) {
    const filetypes = /jpeg|jpg|png|pdf/i
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname))

    callback(null, mimetype && extname)
  },
  limits: {
    files: 1,
  },
})

module.exports = {
  upload,
  uploadDestination,
}
