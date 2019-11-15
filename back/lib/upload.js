const multer = require('multer')
const path = require('path')
const { uploadsDirectory: uploadDestination } = require('config')
const { checkPDFValidity } = require('./pdf-utils')
const winston = require('./log')

const uploadMiddleware = multer({
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

    callback(null, hasValidMimeType && hasValidExtname)
  },
  limits: {
    files: 1,
  },
})

const checkPDFValidityMiddleware = (req, res, next) => {
  if (!req.file || !req.file.path.endsWith('pdf')) return next()

  return checkPDFValidity(req.file.path)
    .then(() => next())
    .catch(() => {
      winston.warn(
        `User ${req.session.user.id} sent invalid PDF, showing them an error`,
      )
      res.status(422).json({
        message: 'Invalid PDF file',
      })
    })
}

const uploadCSV = multer({
  storage: multer.diskStorage({
    destination: uploadDestination,
    filename(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`)
    },
  }),
  fileFilter(req, file, callback) {
    const extensions = /csv/i
    const mimetypes = /csv/i
    const mimetype = mimetypes.test(file.mimetype)
    const extname = extensions.test(path.extname(file.originalname))
    callback(null, mimetype && extname)
  },
  limits: {
    files: 1,
  },
})

module.exports = {
  uploadMiddleware,
  uploadCSV,
  uploadDestination,
  checkPDFValidityMiddleware,
}
