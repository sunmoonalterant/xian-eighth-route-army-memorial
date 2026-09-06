const multer = require('multer')
const { createHttpError } = require('./httpError')
const { MIME_BY_EXTENSION, MAX_IMAGE_SIZE } = require('./imageUpload')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (request, file, callback) => {
    const extension = String(file.originalname || '').split('.').pop().toLowerCase()
    const allowed = MIME_BY_EXTENSION[extension] === file.mimetype
    callback(allowed ? null : createHttpError(400, 'file MIME type is not allowed'), allowed)
  },
})

function uploadImage(request, response, next) {
  upload.single('image')(request, response, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') return next(createHttpError(400, 'file is too large'))
    return next(error)
  })
}

module.exports = { uploadImage }
