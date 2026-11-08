const { query, withTransaction } = require('../db.js');
const { puedenChatear } = require('../services/acceso.js');
const { notificarMensajeAlProfesional } = require('../services/notificaciones.js');

// 1. Obtener lista de contactos con los que el usuario puede chatear
async function listarContactos(req, res) {
    const miId = req.user.id;
    const miRol = req.user.rol; // 0: Paciente, 1: Acompañante, 2: Doctor

    try {
        let sql = '';
        if (miRol === 0) {
            // Si es Paciente: trae sus doctores y acompañantes aceptados (estado = 1)
            sql = `
                SELECT u."id", u."nombre", u."apellido", u."foto", u."rol"
                FROM "Usuario" u
                WHERE u."id" IN (
                    SELECT "doctorId" FROM "Doctor_Paciente" WHERE "pacienteId" = $1 AND "estado" = 1
                    UNION
                    SELECT "idAcompañante" FROM "Acompañante_Paciente" WHERE "idPaciente" = $1 AND "estado" = 1
                )
            `;
        } else if (miRol === 1) {
            // Si es Acompañante: trae sus pacientes aceptados
            sql = `
                SELECT u."id", u."nombre", u."apellido", u."foto", u."rol"
                FROM "Usuario" u
                JOIN "Acompañante_Paciente" ap ON ap."idPaciente" = u."id"
                WHERE ap."idAcompañante" = $1 AND ap."estado" = 1
            `;
        } else {
            // Si es Doctor (rol 2): trae sus pacientes aceptados
            sql = `
                SELECT u."id", u."nombre", u."apellido", u."foto", u."rol"
                FROM "Usuario" u
                JOIN "Doctor_Paciente" dp ON dp."pacienteId" = u."id"
                WHERE dp."doctorId" = $1 AND dp."estado" = 1
            `;
        }

        const contactosResult = await query(sql, [miId]);

        return res.status(200).json({
            message: 'Contactos obtenidos con éxito',
            contactos: contactosResult.rows
        });
    } catch (e) {
        console.error('Error en listarContactos:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// 2. Historial de mensajes ordenados cronológicamente
async function historial(req, res) {
    const otroId = req.params.idUsuario;
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 50, 1), 100);

    try {
        if (!(await puedenChatear(req.user.id, otroId))) {
            return res.status(403).json({ message: 'No podés ver esta conversación' });
        }
        const r = await query(
            `SELECT "id", "contenido", "fecha", "remitente", "receptor"
             FROM (
                 SELECT "id", "contenido", "fecha", "remitente", "receptor"
                 FROM "Mensaje"
                 WHERE ("remitente" = $1 AND "receptor" = $2)
                    OR ("remitente" = $2 AND "receptor" = $1)
                 ORDER BY "fecha" DESC
                 LIMIT $3
             ) mensajes_recientes
             ORDER BY "fecha" ASC`,
            [req.user.id, otroId, limite]
        );
        return res.status(200).json({ mensajes: r.rows });
    } catch (e) {
        if (e.code === '22P02') return res.status(400).json({ message: 'ID inválido' });
        console.error('Error en historial:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// 3. Guardar y enviar nuevo mensaje
async function enviarMensaje(req, res) {
    const { receptorId, contenido } = req.body;
    const remitenteId = req.user.id;

    if (!receptorId || !contenido || !contenido.trim()) {
        return res.status(400).json({ message: 'Receptor y contenido son requeridos' });
    }
    if (contenido.trim().length > 2000) {
        return res.status(400).json({ message: 'El mensaje supera los 2000 caracteres' });
    }

    try {
        if (!(await puedenChatear(remitenteId, receptorId))) {
            return res.status(403).json({ message: 'No tenés permiso para enviar mensajes a este usuario' });
        }

        const r = await withTransaction(async (client) => {
            const mensaje = await client.query(
                `INSERT INTO "Mensaje" ("remitente", "receptor", "contenido", "fecha")
                 VALUES ($1, $2, $3, NOW())
                 RETURNING "id", "contenido", "fecha", "remitente", "receptor"`,
                [remitenteId, receptorId, contenido.trim()]
            );
            await notificarMensajeAlProfesional(client, remitenteId, receptorId);
            return mensaje;
        });

        return res.status(201).json({
            message: 'Mensaje enviado con éxito',
            mensaje: r.rows[0]
        });
    } catch (e) {
        console.error('Error en enviarMensaje:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = { historial, listarContactos, enviarMensaje };