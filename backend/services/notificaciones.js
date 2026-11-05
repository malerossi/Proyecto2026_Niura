async function crearNotificacion(db, {
    receptorId,
    pacienteId,
    tipo,
    titulo,
    mensaje
}) {
    await db.query(
        `INSERT INTO "Notificacion"
            ("receptorId", "pacienteId", "tipo", "titulo", "mensaje")
         VALUES ($1, $2, $3, $4, $5)`,
        [receptorId, pacienteId, tipo, titulo, mensaje]
    )
}

async function notificarProfesionalesDelPaciente(db, {
    pacienteId,
    tipo,
    titulo,
    mensaje
}) {
    await db.query(
        `INSERT INTO "Notificacion"
            ("receptorId", "pacienteId", "tipo", "titulo", "mensaje")
         SELECT profesionales."id", $1, $2, $3, $4
         FROM (
             SELECT dp."doctorId" AS "id"
             FROM "Doctor_Paciente" dp
             WHERE dp."pacienteId" = $1 AND dp."estado" = 1
             UNION
             SELECT ap."idAcompañante" AS "id"
             FROM "Acompañante_Paciente" ap
             WHERE ap."idPaciente" = $1 AND ap."estado" = 1
         ) profesionales`,
        [pacienteId, tipo, titulo, mensaje]
    )
}

async function notificarMensajeAlProfesional(db, remitenteId, receptorId) {
    const receptor = await db.query(
        `SELECT "id", "rol"
         FROM "Usuario" WHERE "id" = $1`,
        [receptorId]
    )
    if (![1, 2].includes(receptor.rows[0]?.rol)) return

    const paciente = await db.query(
        `SELECT "rol", "nombre", "apellido"
         FROM "Usuario" WHERE "id" = $1`,
        [remitenteId]
    )
    if (paciente.rows[0]?.rol !== 0) return
    const { nombre, apellido } = paciente.rows[0]

    await crearNotificacion(db, {
        receptorId,
        pacienteId: remitenteId,
        tipo: 'mensaje_chat',
        titulo: 'Nuevo mensaje',
        mensaje: `${nombre} ${apellido || ''} te envió un mensaje.`.trim()
    })
}

module.exports = {
    crearNotificacion,
    notificarProfesionalesDelPaciente,
    notificarMensajeAlProfesional
}
