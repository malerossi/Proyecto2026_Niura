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

module.exports = { puedeAccederAPaciente }