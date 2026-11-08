const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')
const { query } = require('../db.js')
const { marcarTareaCompletada } = require('./usuarios.js')
const { puedeAccederAPaciente } = require('../services/acceso.js')

const URL_EXPIRA_SEGUNDOS = 600 // 10 minutos

function subirACloudinary(buffer, carpeta) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                type: 'authenticated',
                folder: carpeta
            },
            (error, result) => {
                if (error) return reject(error)
                if (!result) return reject(new Error('Cloudinary no devolvió el archivo subido'))
                resolve(result)
            }
        )
        streamifier.createReadStream(buffer).pipe(stream)
    })
}

function subirImagenACloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: 'perfiles_fotos',
                format: 'jpg'
            },
            (error, result) => (result ? resolve(result) : reject(error))
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

async function subirFotoPerfil(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'No se ha adjuntado ningún archivo de imagen' });
    }

    try {
        const result = await subirImagenACloudinary(req.file.buffer);
        const urlFoto = result.secure_url; // URL pública en Cloudinary

        await query(
            `UPDATE "Usuario" SET "foto" = $1 WHERE "id" = $2`,
            [urlFoto, req.user.id]
        );

        return res.status(200).json({
            message: 'Foto de perfil actualizada con éxito',
            foto: urlFoto
        });
    } catch (error) {
        console.error('Error al subir foto de perfil:', error);
        return res.status(500).json({ message: 'Error al procesar la imagen de perfil' });
    }
}

module.exports = { subirFotoPerfil };

async function limpiar(publicId) {
    try {
        await query(`DELETE FROM "Video" WHERE "publicId" = $1`, [publicId])
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video', type: 'authenticated' })
    } catch (e) {
        console.error('No se pudo limpiar el video huérfano:', publicId, e)
    }
}

async function subirVideoPaciente(req, res) {
    const { tareaID } = req.body
    const idPaciente = req.user.id

    if (!req.file) {
        return res.status(400).json({ message: 'No se ha adjuntado ningún archivo de video' })
    }
    if (!req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ message: 'El archivo adjunto debe ser un video' })
    }
    if (!tareaID) {
        return res.status(400).json({ message: 'Se requiere el ID de la tarea' })
    }

    let publicId = null
    try {
        const tarea = await query(
            `SELECT "id" FROM "Tarea"
             WHERE "id" = $1 AND "idPaciente" = $2 AND "estado" = 0
               AND COALESCE(NULLIF(LOWER(BTRIM("tipo")), ''), 'video') = 'video'`,
            [tareaID, idPaciente]
        )
        if (tarea.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontró una tarea pendiente con ese ID' })
        }

        const result = await subirACloudinary(req.file.buffer, 'niura_videos')
        publicId = result.public_id

        const video = await query(
            `INSERT INTO "Video" ("idTarea", "idPaciente", "publicId", "duracion")
             VALUES ($1, $2, $3, $4) RETURNING "id"`,
            [tareaID, idPaciente, publicId, result.duration ?? null]
        )

        const completada = await marcarTareaCompletada(idPaciente, tareaID)
        if (!completada) { 
            await limpiar(publicId)
            return res.status(409).json({ message: 'La tarea ya fue completada' })
        }

        return res.status(201).json({
            message: 'Video subido con éxito',
            idVideo: video.rows[0].id,
            duracion: result.duration,
            racha: completada.racha
        })
    } catch (error) {
        if (publicId) await limpiar(publicId)
        console.error('Error al subir video:', error)
        return res.status(500).json({ message: 'Error al procesar la subida del video' })
    }
}

async function limpiarAudio(publicId) {
    try {
        await query(`DELETE FROM "Audio" WHERE "publicId" = $1`, [publicId])
    } catch (error) {
        console.error('No se pudo borrar el registro de audio huérfano:', publicId, error)
    }
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
            type: 'authenticated'
        })
    } catch (error) {
        console.error('No se pudo borrar el archivo de audio huérfano:', publicId, error)
    }
}

async function subirAudioPaciente(req, res) {
    const { tareaID } = req.body
    const pacienteId = req.user.id
    if (!req.file) {
        return res.status(400).json({ message: 'No se ha adjuntado ningún archivo de audio' })
    }
    if (!req.file.mimetype.startsWith('audio/')) {
        return res.status(400).json({ message: 'El archivo adjunto debe ser un audio' })
    }
    if (!tareaID) {
        return res.status(400).json({ message: 'Se requiere el ID de la tarea' })
    }

    let publicId = null
    try {
        const tarea = await query(
            `SELECT "id" FROM "Tarea"
             WHERE "id" = $1 AND "idPaciente" = $2 AND "estado" = 0
               AND LOWER(BTRIM("tipo")) = 'audio'`,
            [tareaID, pacienteId]
        )
        if (tarea.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontró una tarea de audio pendiente con ese ID' })
        }

        const resultado = await subirACloudinary(req.file.buffer, 'niura_audios')
        publicId = resultado.public_id
        const audio = await query(
            `INSERT INTO "Audio" ("idTarea", "idPaciente", "publicId", "duracion")
             VALUES ($1, $2, $3, $4) RETURNING "id"`,
            [tareaID, pacienteId, publicId, resultado.duration ?? null]
        )

        const completada = await marcarTareaCompletada(pacienteId, tareaID)
        if (!completada) {
            await limpiarAudio(publicId)
            return res.status(409).json({ message: 'La tarea ya fue completada' })
        }

        return res.status(201).json({
            message: 'Audio subido con éxito',
            idAudio: audio.rows[0].id,
            duracion: resultado.duration,
            racha: completada.racha
        })
    } catch (error) {
        if (publicId) await limpiarAudio(publicId)
        if (error.code === '22P02') {
            return res.status(400).json({ message: 'ID de tarea inválido' })
        }
        console.error('Error al subir audio:', error)
        return res.status(500).json({ message: 'Error al procesar la subida del audio' })
    }
}

// Metadatos de los videos de un paciente (sin URLs)
async function listarVideosPaciente(req, res) {
    const { idPaciente } = req.params
    try {
        if (!(await puedeAccederAPaciente(req.user, idPaciente))) {
            return res.status(403).json({ message: 'No tenés acceso a los videos de este paciente' })
        }
        const result = await query(
            `SELECT "id", "idTarea", "duracion", "estadoProcesamiento", "puntaje", "creadoEn"
             FROM "Video" WHERE "idPaciente" = $1 ORDER BY "creadoEn" DESC`,
            [idPaciente]
        )
        return res.status(200).json({ videos: result.rows })
    } catch (e) {
        if (e.code === '22P02') return res.status(400).json({ message: 'ID inválido' })
        console.error(e)
        return res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// La URL se genera recién ahora, después de verificar permisos, y vence sola
async function obtenerUrlVideo(req, res) {
    try {
        const video = await query(
            `SELECT "publicId", "idPaciente" FROM "Video" WHERE "id" = $1`, [req.params.id]
        )
        // Mismo 404 si no existe o si no tenés permiso: no revelamos qué videos existen
        if (
            video.rows.length === 0 ||
            !(await puedeAccederAPaciente(req.user, video.rows[0].idPaciente))
        ) {
            return res.status(404).json({ message: 'Video no encontrado' })
        }

        const url = cloudinary.utils.private_download_url(video.rows[0].publicId, 'mp4', {
            resource_type: 'video',
            type: 'authenticated',
            expires_at: Math.floor(Date.now() / 1000) + URL_EXPIRA_SEGUNDOS
        })
        return res.status(200).json({ url, expiraEnSegundos: URL_EXPIRA_SEGUNDOS })
    } catch (e) {
        if (e.code === '22P02') return res.status(404).json({ message: 'Video no encontrado' })
        console.error(e)
        return res.status(500).json({ message: 'Error interno del servidor' })
    }
}

module.exports = {
    subirVideoPaciente,
    subirAudioPaciente,
    listarVideosPaciente,
    obtenerUrlVideo,
    subirFotoPerfil
}