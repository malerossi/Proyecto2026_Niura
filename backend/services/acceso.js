const { query } = require('../db.js')

async function puedeAccederAPaciente(user, idPaciente) {
    if (user.rol === 0) return String(user.id) === String(idPaciente)

    if (user.rol === 2) {
        const r = await query(
            `SELECT 1 FROM "Doctor_Paciente"
             WHERE "idDoctor" = $1 AND "idPaciente" = $2 AND "estado" = 1`,
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
           AND (("idDoctor" = $1 AND "idPaciente" = $2) OR ("idDoctor" = $2 AND "idPaciente" = $1))
         UNION ALL
         SELECT 1 FROM "Acompañante_Paciente"
         WHERE "estado" = 1
           AND (("idAcompanante" = $1 AND "idPaciente" = $2) OR ("idAcompanante" = $2 AND "idPaciente" = $1))
         LIMIT 1`,
        [idA, idB]
    )
    return r.rows.length > 0
}


module.exports = { puedeAccederAPaciente, puedenChatear }