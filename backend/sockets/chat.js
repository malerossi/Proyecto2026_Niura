const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/jwt.js')
const { query } = require('../db.js')
const { puedenChatear } = require('../services/acceso.js')

const MAX_LARGO = 2000
const MAX_MENSAJES = 20     
const VENTANA_MS = 10_000

function initChat(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token
            if (!token) return next(new Error('No autorizado'))
            socket.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
            next()
        } catch {
            next(new Error('No autorizado'))
        }
    })

    io.on('connection', (socket) => {
        const miId = socket.user.id
        socket.join(`user_${miId}`)  

        socket.on('enviar_mensaje_privado', async (data, ack) => {
            const responder = (r) => typeof ack === 'function' && ack(r)
            const ahora = Date.now()
            const recientes = (socket.data.envios ?? []).filter(t => ahora - t < VENTANA_MS)
            if (recientes.length >= MAX_MENSAJES) {
                return responder({ ok: false, error: 'Estás enviando mensajes demasiado rápido' })
            }
            socket.data.envios = [...recientes, ahora]

            const receptorId = data?.receptorId
            const contenido = typeof data?.contenido === 'string' ? data.contenido.trim() : ''
            if (!receptorId || !contenido) {
                return responder({ ok: false, error: 'Faltan el receptor o el contenido' })
            }
            if (contenido.length > MAX_LARGO) {
                return responder({ ok: false, error: `El mensaje supera los ${MAX_LARGO} caracteres` })
            }
            if (String(receptorId) === String(miId)) {
                return responder({ ok: false, error: 'No podés enviarte mensajes a vos mismo' })
            }

            try {
                if (!(await puedenChatear(miId, receptorId))) {
                    return responder({ ok: false, error: 'No podés chatear con este usuario' })
                }

             
                const r = await query(
                    `INSERT INTO "Mensaje" ("contenido", "fecha", "remitente", "receptor")
                     VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
                     RETURNING "id", "contenido", "fecha", "remitente", "receptor"`,
                    [contenido, miId, receptorId]
                )
                const mensaje = r.rows[0]

                io.to(`user_${receptorId}`).to(`user_${miId}`).emit('recibir_mensaje_privado', mensaje)
                responder({ ok: true, mensaje })
            } catch (e) {
                if (e.code === '22P02') return responder({ ok: false, error: 'ID de receptor inválido' })
                console.error('Error al guardar mensaje:', e)
                responder({ ok: false, error: 'No se pudo enviar el mensaje' })
            }
        })
    })
}

module.exports = { initChat }