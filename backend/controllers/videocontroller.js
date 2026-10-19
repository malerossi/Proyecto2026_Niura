const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

async function subirVideoPaciente(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha adjuntado ningún archivo de video' });
        }

        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video', 
                        folder: 'pacientes_videos', 
                        format: 'mp4'
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        const result = await uploadToCloudinary(req.file.buffer);

        return res.status(200).json({
            message: 'Video subido con éxito',
            videoUrl: result.secure_url,
            publicId: result.public_id,
            duration: result.duration
        });

    } catch (error) {
        console.error('Error al subir video a Cloudinary:', error);
        return res.status(500).json({ 
            message: 'Error al procesar la subida del video', 
            error: error.message 
        });
    }
}

module.exports = { subirVideoPaciente };