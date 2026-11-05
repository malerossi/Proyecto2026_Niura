const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('video/')
        || file.mimetype.startsWith('audio/')
        || file.mimetype.startsWith('image/')
    ) {
        cb(null, true);
    } else {
        cb(new Error('El archivo debe ser una imagen, video o audio válido'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // Límite de 100 MB
});

module.exports = upload;