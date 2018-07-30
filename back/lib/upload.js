const multer = require('multer')
const path = require('path')
const { uploadsDirectory: uploadDestination } = require('config')

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDestination,
    filename(req, file, cb) {
      const fileExtension = path.extname(file.originalname).toLowerCase()
      // Renaming jpeg files, since when transferring data to it, pole-emploi.fr does not handle
      // "jpeg" files >_<
      cb(
        null,
        `${req.session.user.id}-${Date.now()}-${
          fileExtension === '.jpeg' ? '.jpg' : fileExtension
        }`,
      )
    },
  }),
  fileFilter(req, file, callback) {
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
