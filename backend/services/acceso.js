const { query } = require('../db.js')

async function puedeAccederAPaciente(user, idPaciente) {
    if (user.rol === 0) return String(user.id) === String(idPaciente)

    if (user.rol === 2) {
        const r = await query(
            `SELECT 1 FROM "Doctor_Paciente"
             WHERE "doctorId" = $1 AND "pacienteId" = $2 AND "estado" = 1`,
            [user.id, idPaciente]
        )
        return r.rows.length > 0
    }
    return false
}

async function puedenChatear(idA, idB) {
    const r = await query(
        `SELECT 1 FROM "Doctor_Paciente"
         WHERE "estado" = 1
           AND (("doctorId" = $1 AND "pacienteId" = $2) OR ("doctorId" = $2 AND "pacienteId" = $1))
         UNION ALL
         SELECT 1 FROM "Acompañante_Paciente"
         WHERE "estado" = 1
           AND (("idAcompañante" = $1 AND "idPaciente" = $2) OR ("idAcompañante" = $2 AND "idPaciente" = $1))
         LIMIT 1`,
        [idA, idB]
    )
    return r.rows.length > 0
}


module.exports = { puedeAccederAPaciente, puedenChatear }