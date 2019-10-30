const multer = require('multer')
const path = require('path')
const { uploadsDirectory: uploadDestination } = require('config')
const { checkPDFValidity } = require('./pdf-utils')

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
    const extensions = /jpeg|jpg|png|pdf/i
    const mimetypes = /jpeg|jpg|png|pdf/i
    const hasValidMimeType = mimetypes.test(file.mimetype)
    const extension = path.extname(file.originalname)
    const hasValidExtname = extensions.test(extension)

    if (extension.includes('pdf')) {
      return checkPDFValidity(file.path)
        .then(() => callback(null, true))
        .catch(callback)
    }

    callback(null, hasValidMimeType && hasValidExtname)
  },
  limits: {
    files: 1,
  },
})

module.exports = {
  upload,
}
