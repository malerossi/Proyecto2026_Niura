const { query } = require('../db.js')

async function listarNotificaciones(req, res) {
    try {
        const resultado = await query(
            `SELECT n."id", n."tipo", n."titulo", n."mensaje", n."pacienteId",
                    n."creadoEn", n."leida"
             FROM "Notificacion" n
             WHERE n."receptorId" = $1
             ORDER BY n."creadoEn" DESC, n."id" DESC
             LIMIT 100`,
            [req.user.id]
        )
        return res.status(200).json({ notificaciones: resultado.rows })
    } catch (error) {
        console.error('Error al listar notificaciones:', error)
        return res.status(500).json({ message: 'No se pudieron cargar las notificaciones' })
    }
}

async function contarNotificacionesNoLeidas(req, res) {
    try {
        const resultado = await query(
            `SELECT COUNT(*)::int AS cantidad
             FROM "Notificacion"
             WHERE "receptorId" = $1 AND "leida" = false`,
            [req.user.id]
        )
        return res.status(200).json({ noLeidas: resultado.rows[0].cantidad })
    } catch (error) {
        console.error('Error al contar notificaciones:', error)
        return res.status(500).json({ message: 'No se pudo consultar el contador de notificaciones' })
    }
}

async function marcarNotificacionLeida(req, res) {
    try {
        const resultado = await query(
            `UPDATE "Notificacion"
             SET "leida" = true
             WHERE "id" = $1 AND "receptorId" = $2
             RETURNING "id"`,
            [req.params.id, req.user.id]
        )
        if (resultado.rows.length === 0) {
            return res.status(404).json({ message: 'Notificación no encontrada' })
        }
        return res.status(200).json({ message: 'Notificación marcada como leída' })
    } catch (error) {
        if (error.code === '22P02') {
            return res.status(400).json({ message: 'ID de notificación inválido' })
        }
        console.error('Error al marcar notificación como leída:', error)
        return res.status(500).json({ message: 'No se pudo actualizar la notificación' })
    }
}

module.exports = {
    listarNotificaciones,
    contarNotificacionesNoLeidas,
    marcarNotificacionLeida
}
