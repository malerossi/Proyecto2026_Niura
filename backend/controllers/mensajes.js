const { query } = require('../db.js')
const { puedenChatear } = require('../services/acceso.js')

async function historial(req, res) {
    const otroId = req.params.idUsuario
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 50, 1), 100)

    try {
        if (!(await puedenChatear(req.user.id, otroId))) {
            return res.status(403).json({ message: 'No podés ver esta conversación' })
        }
        const r = await query(
            `SELECT "id", "contenido", "fecha", "remitente", "receptor"
             FROM "Mensaje"
             WHERE ("remitente" = $1 AND "receptor" = $2) OR ("remitente" = $2 AND "receptor" = $1)
             ORDER BY "fecha" DESC LIMIT $3`,
            [req.user.id, otroId, limite]
        )
        return res.status(200).json({ mensajes: r.rows })
    } catch (e) {
        if (e.code === '22P02') return res.status(400).json({ message: 'ID inválido' })
        console.error(e)
        return res.status(500).json({ message: 'Error interno del servidor' })
    }
}

module.exports = { historial }