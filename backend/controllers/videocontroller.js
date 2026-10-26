const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')
const { query } = require('../db.js')
const { marcarTareaCompletada } = require('./usuarios.js')
const { puedeAccederAPaciente } = require('../services/acceso.js')

const URL_EXPIRA_SEGUNDOS = 600 // 10 minutos

function subirACloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                type: 'authenticated',   // privado: sin URL pública
                folder: 'pacientes_videos',
                format: 'mp4'
            },
            (error, result) => (result ? resolve(result) : reject(error))
        )
        streamifier.createReadStream(buffer).pipe(stream)
    })
}

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
    if (!tareaID) {
        return res.status(400).json({ message: 'Se requiere el ID de la tarea' })
    }

    let publicId = null
    try {
        const tarea = await query(
            `SELECT "id" FROM "Tarea" WHERE "id" = $1 AND "idPaciente" = $2 AND "estado" = 0`,
            [tareaID, idPaciente]
        )
        if (tarea.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontró una tarea pendiente con ese ID' })
        }

        const result = await subirACloudinary(req.file.buffer)
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

module.exports = { subirVideoPaciente, listarVideosPaciente, obtenerUrlVideo }