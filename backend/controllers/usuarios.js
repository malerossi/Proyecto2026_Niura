const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config/jwt.js')
const { query, withTransaction } = require('../db.js');
const { notificarProfesionalesDelPaciente, crearNotificacion } = require('../services/notificaciones.js')
const { puedeAccederAPaciente } = require('../services/acceso.js')

// 0: Paciente 1: Acompañante 2: Doctor

async function createPatient(req, res) {
    const { name, surname, email, password } = req.body;
    
    try {
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const result = await query(
            `INSERT INTO "Usuario" ("nombre", "apellido", "email", "password", "rol") 
             VALUES ($1, $2, $3, $4, 0) RETURNING "id", "nombre", "apellido", "email", "rol"`,
            [name, surname, email, hashed]
        );

        return res.status(201).json({
            message: 'Paciente creado con éxito',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el paciente', error: error.message });
    }
}

async function createCompanion(req, res) {
    const { name, surname, email, password } = req.body;

    try {
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const result = await query(
            `INSERT INTO "Usuario" ("nombre", "apellido", "email", "password", "rol") 
             VALUES ($1, $2, $3, $4, 1) RETURNING "id", "nombre", "apellido", "email", "rol"`,
            [name, surname, email, hashed]
        );

        return res.status(201).json({
            message: 'Acompañante creado con éxito',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el acompañante', error: error.message });
    }
}

async function createDoctor(req, res) {
    const { name, surname, email, password } = req.body;

    try {
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const result = await query(
            `INSERT INTO "Usuario" ("nombre", "apellido", "email", "password", "rol") 
             VALUES ($1, $2, $3, $4, 2) RETURNING "id", "nombre", "apellido", "email", "rol"`,
            [name, surname, email, hashed]
        );

        return res.status(201).json({
            message: 'Doctor creado con éxito',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el doctor', error: error.message });
    }
}

async function loginGeneral(req, res) {
    const { email, nombre, apellido, password } = req.body;

    // 1. Verificar que vengan los 4 campos
    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ 
            message: 'Se requieren nombre, apellido, email y contraseña para iniciar sesión' 
        });
    }

    try {
        // 2. Consulta SQL que exige coincidencia de Nombre, Apellido Y Email juntos
        const result = await query(
            `SELECT * FROM "Usuario" 
             WHERE LOWER("nombre") = LOWER($1) 
               AND LOWER("apellido") = LOWER($2) 
               AND LOWER("email") = LOWER($3)`,
            [nombre.trim(), apellido.trim(), email.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Los datos ingresados (nombre, apellido o email) no coinciden con ninguna cuenta' 
            });
        }

        const user = result.rows[0];

        // 3. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // 4. Generar y devolver el Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({ 
            message: 'Login exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol,
                foto: user.foto
            }, 
            token 
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}
async function agregarObjetos(req, res) {
    const { idObjeto } = req.body;

    try {
        const idPaciente = req.user.id;

        const objetoExistente = await query(
            `SELECT * FROM "Objeto" WHERE "id" = $1`, 
            [idObjeto]
        );

        if (objetoExistente.rows.length === 0) {
            return res.status(404).json({ message: 'El objeto especificado no existe' });
        }

        const result = await query(
            `INSERT INTO "Paciente_Objetos" ("idPaciente", "idObjeto") 
             VALUES ($1, $2) 
             RETURNING *`, 
            [idPaciente, idObjeto]
        );

        return res.status(201).json({
            message: 'Objeto asignado al paciente con éxito',
            relacion: result.rows[0]
        });

    } catch (e) {
        if (e.code === '23505') {
            return res.status(409).json({ message: 'El paciente ya tiene este objeto' })
        }
        console.error(e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}


async function crearTarea(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: 'El cuerpo de la petición no puede estar vacío' });
    }

    const { idPaciente, nombre, descripcion, puntaje } = req.body;
    let objetosRequeridos = req.body.objetosRequeridos ?? [];
    if (typeof objetosRequeridos === 'string') {
        try {
            objetosRequeridos = JSON.parse(objetosRequeridos);
        } catch {
            return res.status(400).json({ message: 'objetosRequeridos debe ser una lista JSON de IDs' });
        }
    }
    const tipo = typeof req.body.tipo === 'string' ? req.body.tipo.trim().toLowerCase() : 'video';
    if (!idPaciente || !nombre || !descripcion) {
        return res.status(400).json({ 
            message: 'Faltan datos requeridos (idPaciente, nombre, descripcion)' 
        });
    }
    if (!['audio', 'video'].includes(tipo)) {
        return res.status(400).json({ message: 'El tipo de tarea debe ser audio o video' });
    }

    try {
        if (!(await puedeAccederAPaciente(req.user, idPaciente))) {
            return res.status(403).json({ message: 'No tenés acceso a este paciente' });
        }
        if (!Array.isArray(objetosRequeridos)) {
            return res.status(400).json({ message: 'objetosRequeridos debe ser una lista de IDs' });
        }

        // 1. Verificar si el paciente tiene los objetos requeridos
        const userObjectsResult = await query(
            `SELECT "idObjeto" FROM "Paciente_Objetos" WHERE "idPaciente" = $1`,
            [idPaciente]
        );

        const objetosPaciente = userObjectsResult.rows.map(row => row.idObjeto);

        const tieneTodosLosObjetos = (objetosRequeridos || []).every(reqId => 
            objetosPaciente.includes(reqId)
        );

        if (!tieneTodosLosObjetos) {
            return res.status(400).json({
                message: 'El paciente no posee los objetos necesarios para realizar la tarea'
            });
        }

        // 2. Insertar en la tabla "Tarea" (estado 0 = pendiente)
        const tareaResult = await query(
            `INSERT INTO "Tarea" ("nombre", "descripcion", "idPaciente", "puntaje", "estado", "tipo")
             VALUES ($1, $2, $3, $4, 0, $5)
             RETURNING *`,
            [nombre.trim(), descripcion.trim(), idPaciente, puntaje || 0, tipo]
        );

        const nuevaTarea = tareaResult.rows[0];

        // 3. Vincular objetos en "Objeto_Tarea" si existen
        if (objetosRequeridos && objetosRequeridos.length > 0) {
            for (const objetoId of objetosRequeridos) {
                await query(
                    `INSERT INTO "Objeto_Tarea" ("objetoId", "tareaId") 
                     VALUES ($1, $2)`,
                    [objetoId, nuevaTarea.id]
                );
            }
        }

        return res.status(201).json({
            message: 'Tarea creada y asignada con éxito',
            tarea: nuevaTarea
        });

    } catch (e) {
        console.error('Error al crear tarea:', e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}

async function marcarTareaCompletada(idPaciente, tareaID) {
    return withTransaction(async (client) => {
        const result = await client.query(
            `UPDATE "Tarea" SET "estado" = 1
             WHERE "id" = $1 AND "idPaciente" = $2 AND "estado" = 0
             RETURNING *`,
            [tareaID, idPaciente]
        )
        if (result.rows.length === 0) return null

        const racha = await actualizarRachaPaciente(idPaciente, client)
        if (racha.updated) {
            const diasRacha = racha.racha.currentStreak
            await notificarProfesionalesDelPaciente(client, {
                pacienteId: idPaciente,
                tipo: 'alerta_racha',
                titulo: 'Progreso de paciente',
                mensaje: `El paciente completó una actividad y ahora tiene una racha de ${diasRacha} días.`
            })
        }
        return { tarea: result.rows[0], racha }
    })
}
async function verPacientesDoctor(req, res) {
    try {
        const idDoctor = req.user.id;

        const result = await query(
            `SELECT u."id", u."nombre", u."apellido", u."email"
             FROM "Doctor_Paciente" dp
             JOIN "Usuario" u ON u."id" = dp."pacienteId"
             WHERE dp."doctorId" = $1 AND dp."estado" = 1
             ORDER BY u."nombre" ASC, u."apellido" ASC`,
            [idDoctor]
        );

        return res.status(200).json({
            message: 'Pacientes vinculados obtenidos con éxito',
            pacientes: result.rows
        });
    } catch (e) {
        console.error('Error en verPacientesDoctor:', e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}
async function completarTarea(req, res) {
    const { tareaID } = req.body

    if (!tareaID) {
        return res.status(400).json({ message: 'Se requiere el ID de la tarea' })
    }

    try {
        const resultado = await marcarTareaCompletada(req.user.id, tareaID)
        if (!resultado) {
            return res.status(404).json({ message: 'No se encontró una tarea pendiente con ese ID' })
        }
        return res.status(200).json({
            message: 'Tarea completada con éxito',
            tarea: resultado.tarea,
            racha: resultado.racha
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Error interno del servidor' })
    }
}

async function actualizarRachaPaciente(patientId, client) {
    const ejecutarConsulta = client
        ? client.query.bind(client)
        : query
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rachaResult = await ejecutarConsulta(
        `SELECT * FROM "Paciente_Racha" WHERE "idPaciente" = $1`, 
        [patientId]
    );

    if (rachaResult.rows.length === 0) {
        const newRacha = await ejecutarConsulta(
            `INSERT INTO "Paciente_Racha" ("wasStreakActivated", "currentStreak", "lastStreakUpdate", "idPaciente")
             VALUES (true, '1', $1, $2) RETURNING *`,
            [today, patientId]
        );

        return { updated: true, racha: newRacha.rows[0], message: 'Primera racha iniciada' };
    }

    const streakData = rachaResult.rows[0];

    let lastUpdate = streakData.lastStreakUpdate ? new Date(streakData.lastStreakUpdate) : null;
    if (lastUpdate) lastUpdate.setHours(0, 0, 0, 0);

    const diffTime = lastUpdate ? today.getTime() - lastUpdate.getTime() : null;
    const diffDays = diffTime !== null ? Math.round(diffTime / (1000 * 60 * 60 * 24)) : null;

    if (diffDays === 0) {
        return { 
            updated: false, 
            racha: streakData, 
            message: 'La racha ya fue incrementada el día de hoy' 
        };
    }

    let currentStreakNum = parseInt(streakData.currentStreak || "0", 10);

    if (diffDays === 1) {
        currentStreakNum += 1;
    } else {
        currentStreakNum = 1;
    }

    const updatedResult = await ejecutarConsulta(
        `UPDATE "Paciente_Racha" 
         SET "currentStreak" = $1, "lastStreakUpdate" = $2, "wasStreakActivated" = true 
         WHERE "idPaciente" = $3 RETURNING *`,
        [currentStreakNum.toString(), today, patientId]
    );

    return { 
        updated: true, 
        racha: updatedResult.rows[0], 
        message: 'Racha incrementada con éxito' 
    };
}

const RELACIONES = {
    doctor:      { tabla: 'Doctor_Paciente',      colEmisor: 'doctorId',       colPaciente: 'pacienteId', etiqueta: 'médico' },
    acompanante: { tabla: 'Acompañante_Paciente', colEmisor: 'idAcompañante', colPaciente: 'idPaciente', etiqueta: 'acompañante' },
}

function enviarInvitacion(tipo) {
    const { tabla, colEmisor, colPaciente, etiqueta } = RELACIONES[tipo]

    return async (req, res) => {
        const { idPaciente } = req.body
        const idEmisor = req.user.id

        if (!idPaciente) {
            return res.status(400).json({ message: 'Se requiere el ID del paciente' })
        }

        try {
            const paciente = await query(
                `SELECT "id" FROM "Usuario" WHERE "id" = $1 AND "rol" = 0`, [idPaciente]
            )
            if (paciente.rows.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' })
            }

            const relacion = await query(
                `SELECT "id", "estado" FROM "${tabla}" WHERE "${colEmisor}" = $1 AND "${colPaciente}" = $2`,
                [idEmisor, idPaciente]
            )

            if (relacion.rows.length > 0) {
                const estado = Number(relacion.rows[0].estado)
                if (estado === 0) {
                    return res.status(400).json({ message: 'Ya le mandaste una invitación a este paciente' })
                }
                if (estado === 1) {
                    return res.status(400).json({ message: `Ya sos ${etiqueta} de este paciente` })
                }
                // estado 2 (rechazada): se permite volver a invitar
                const reenviada = await query(
                    `UPDATE "${tabla}" SET "estado" = 0 WHERE "id" = $1 RETURNING *`,
                    [relacion.rows[0].id]
                )
                return res.status(200).json({ message: 'Invitación enviada con éxito', invitacion: reenviada.rows[0] })
            }

            const nueva = await query(
                `INSERT INTO "${tabla}" ("${colEmisor}", "${colPaciente}", "estado") VALUES ($1, $2, 0) RETURNING *`,
                [idEmisor, idPaciente]
            )
            return res.status(201).json({ message: 'Invitación enviada con éxito', invitacion: nueva.rows[0] })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

function verInvitaciones(tipo) {
    const { tabla, colEmisor, colPaciente } = RELACIONES[tipo]

    return async (req, res) => {
        try {
            const result = await query(
                `SELECT t.*, u."nombre", u."apellido"
                 FROM "${tabla}" t
                 JOIN "Usuario" u ON u."id" = t."${colEmisor}"
                 WHERE t."${colPaciente}" = $1 AND t."estado" = 0`,
                [req.user.id]
            )
            return res.status(200).json({ message: 'Invitaciones obtenidas con éxito', invitaciones: result.rows })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

function aceptarInvitacion(tipo) {
    const { tabla, colEmisor, colPaciente } = RELACIONES[tipo]

    return async (req, res) => {
        const { idInvitacion, aceptar } = req.body

        if (idInvitacion === undefined || typeof aceptar !== 'boolean') {
            return res.status(400).json({ message: 'Faltan parámetros requeridos (idInvitacion, aceptar: true/false)' })
        }

        try {
            const result = await withTransaction(async (client) => {
                const actualizada = await client.query(
                    `UPDATE "${tabla}" SET "estado" = $1
                     WHERE "id" = $2 AND "${colPaciente}" = $3 AND "estado" = 0
                     RETURNING *`,
                    [aceptar ? 1 : 2, idInvitacion, req.user.id]
                )
                if (actualizada.rows.length === 0) return actualizada

                const paciente = await client.query(
                    `SELECT "nombre", "apellido" FROM "Usuario" WHERE "id" = $1`,
                    [req.user.id]
                )
                const nombrePaciente = `${paciente.rows[0].nombre} ${paciente.rows[0].apellido || ''}`.trim()
                await crearNotificacion(client, {
                    receptorId: actualizada.rows[0][colEmisor],
                    pacienteId: req.user.id,
                    tipo: 'solicitud_vinculo',
                    titulo: aceptar ? 'Solicitud aceptada' : 'Solicitud rechazada',
                    mensaje: `${nombrePaciente} ${aceptar ? 'aceptó' : 'rechazó'} tu solicitud de vinculación.`
                })
                return actualizada
            })

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No se encontró una invitación pendiente con ese ID' })
            }

            return res.status(200).json({
                message: aceptar
                    ? 'Invitación aceptada con éxito. El vínculo ha sido establecido.'
                    : 'Invitación rechazada.',
                invitacion: result.rows[0]
            })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

const enviarInvitacionDoctor = enviarInvitacion('doctor')
const enviarInvitacionAcompañante = enviarInvitacion('acompanante')
const verInvitacionesDoctor = verInvitaciones('doctor')
const verInvitacionesAcompañante = verInvitaciones('acompanante')
const aceptarInvitacionDoctor = aceptarInvitacion('doctor')
const aceptarInvitacionAcompañante = aceptarInvitacion('acompanante')

async function verTareas(req, res) {
    const patientId = req.query.idPaciente
    if (!patientId) {
        return res.status(400).json({ message: 'Se requiere el ID del paciente' })
    }

    try {
        if (!(await puedeAccederAPaciente(req.user, patientId))) {
            return res.status(403).json({ message: 'No tenés acceso a las tareas de este paciente' })
        }
        const result = await query(
            `SELECT "id", "nombre", "descripcion", "tipo", "estado", "puntaje"
             FROM "Tarea" WHERE "idPaciente" = $1 ORDER BY "id" DESC`,
            [patientId]
        );
        return res.status(200).json({ message: 'Tareas obtenidas con éxito', tareas: result.rows });
    } catch (e) {
        if (e.code === '22P02') return res.status(400).json({ message: 'ID de paciente inválido' })
        console.error('Error en verTareas:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verTareasPaciente(req, res) {
    const tipo = req.query.tipo
    const tareaId = req.query.idTarea
    if (tipo !== undefined && !['audio', 'video'].includes(tipo)) {
        return res.status(400).json({ message: 'El tipo de tarea debe ser audio o video' })
    }

    try {
        const result = await query(
            `SELECT "id", "nombre", "descripcion",
                    COALESCE(NULLIF(LOWER(BTRIM("tipo")), ''), 'video') AS "tipo",
                    "estado", "puntaje"
             FROM "Tarea"
             WHERE "idPaciente" = $1 AND "estado" = 0
               AND ($2::text IS NULL OR COALESCE(NULLIF(LOWER(BTRIM("tipo")), ''), 'video') = $2)
               AND ($3::integer IS NULL OR "id" = $3)
             ORDER BY "id" DESC`,
            [req.user.id, tipo ?? null, tareaId ?? null]
        )
        return res.status(200).json({ tareas: result.rows })
    } catch (error) {
        if (error.code === '22P02') {
            return res.status(400).json({ message: 'ID de tarea inválido' })
        }
        console.error('Error al listar tareas del paciente:', error)
        return res.status(500).json({ message: 'No se pudieron cargar las tareas del paciente' })
    }
}

async function verRacha(req, res) {
    try {
        const result = await query(
            `SELECT "currentStreak" FROM "Paciente_Racha" WHERE "idPaciente" = $1`,
            [req.user.id]
        )
        return res.status(200).json({
            message: 'Racha obtenida con éxito',
            racha: result.rows[0]?.currentStreak ?? 0
        })
    } catch (e) {
        console.error('Error en verRacha:', e)
        return res.status(500).json({ message: 'No se pudo obtener la racha' })
    }
}

async function verDatosPaciente(req, res) {
    const patientId = req.user.id
    try {
        const result = await query(
            `SELECT "id", "nombre", "apellido", "email", "rol", "foto"
             FROM "Usuario"
             WHERE "id" = $1 AND "rol" = 0`,
            [patientId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        return res.status(200).json({ message: 'Datos obtenidos con éxito', datos: result.rows[0] });
    } catch (e) {
        console.error('Error en verDatosPaciente:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function cambiarCorreo(req, res) {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : null;
    const userId = req.user.id;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'El email ingresado no es válido' });
    }

    try {
        const result = await query(
            `UPDATE "Usuario" SET "email" = $1 WHERE "id" = $2 RETURNING "id", "email"`,
            [email, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            message: 'Correo actualizado con éxito',
            email: result.rows[0].email
        });
    } catch (e) {
        console.error('Error al cambiar correo:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verPerfilDoctor(req, res) {
    try {
        const result = await query(
            `SELECT "id", "nombre", "apellido", "email", "rol", "foto"
             FROM "Usuario"
             WHERE "id" = $1 AND "rol" = 2`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor no encontrado' });
        }

        return res.status(200).json({
            message: 'Perfil obtenido con éxito',
            medico: result.rows[0]
        });
    } catch (e) {
        console.error('Error en verPerfilDoctor:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function eliminarPacienteVinculado(req, res) {
    const { pacienteId } = req.body;
    const idDoctor = req.user.id;

    if (!pacienteId) {
        return res.status(400).json({ message: 'Se requiere el ID del paciente' });
    }

    try {
        const result = await query(
            `DELETE FROM "Doctor_Paciente"
             WHERE "doctorId" = $1 AND "pacienteId" = $2
             RETURNING *`,
            [idDoctor, pacienteId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontró un vínculo activo con ese paciente' });
        }

        return res.status(200).json({ message: 'Paciente desvinculado con éxito' });
    } catch (e) {
        console.error('Error al eliminar paciente:', e);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
module.exports = {
    createPatient, createCompanion, createDoctor, loginGeneral,
    agregarObjetos, crearTarea, completarTarea,
    enviarInvitacionAcompañante, verInvitacionesAcompañante, aceptarInvitacionAcompañante,
    enviarInvitacionDoctor, verInvitacionesDoctor, aceptarInvitacionDoctor,
    verTareas, verTareasPaciente, verRacha, verDatosPaciente, cambiarCorreo, marcarTareaCompletada, verPacientesDoctor,
    verPerfilDoctor, eliminarPacienteVinculado
}