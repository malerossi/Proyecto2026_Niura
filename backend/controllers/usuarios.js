const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config/jwt.js')
const { query } = require('../db.js');

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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Se requieren el email y la contraseña' });
    }

    try {
        const result = await query(`SELECT * FROM "Usuario" WHERE "email" = $1`, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        )

        return res.status(200).json({ 
            message: 'Login exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol
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
    const { token, idPaciente, nombre, descripcion, puntaje, objetosRequeridos } = req.body;

    try {
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

        const tareaResult = await query(
            `INSERT INTO "Tarea" ("nombre", "descripcion", "idPaciente", "puntaje") 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [nombre, descripcion, idPaciente, puntaje || 0]
        );

        const nuevaTarea = tareaResult.rows[0];

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
        console.error(e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}

async function completarTarea(req, res) {
    const { tareaID, idPaciente } = req.body;

    if (!tareaID || !idPaciente) {
        return res.status(400).json({ message: 'Se requieren el ID de la tarea y el ID del paciente' });
    }

    try {
        const result = await query(
            `UPDATE "Tarea" 
             SET "estado" = 1 
             WHERE "id" = $1 AND "idPaciente" = $2 AND "estado" = 0
             RETURNING *`,
            [tareaID, idPaciente]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No se encontró la tarea pendiente o no pertenece al paciente indicado'
            });
        }

    const estadoRacha = await actualizarRachaPaciente(req.user.id);

        return res.status(200).json({
            message: 'Tarea completada con éxito',
            tarea: result.rows[0],
            racha: estadoRacha
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}

async function actualizarRachaPaciente(patientId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rachaResult = await query(
        `SELECT * FROM "Paciente_Racha" WHERE "idPaciente" = $1`, 
        [patientId]
    );

    if (rachaResult.rows.length === 0) {
        const newRacha = await query(
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

    const updatedResult = await query(
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
    doctor:      { tabla: 'Doctor_Paciente',      colEmisor: 'idDoctor',      etiqueta: 'médico' },
    acompanante: { tabla: 'Acompañante_Paciente', colEmisor: 'idAcompanante', etiqueta: 'acompañante' },
}

function enviarInvitacion(tipo) {
    const { tabla, colEmisor, etiqueta } = RELACIONES[tipo]

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
                `SELECT "id", "estado" FROM "${tabla}" WHERE "${colEmisor}" = $1 AND "idPaciente" = $2`,
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
                `INSERT INTO "${tabla}" ("${colEmisor}", "idPaciente", "estado") VALUES ($1, $2, 0) RETURNING *`,
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
    const { tabla, colEmisor } = RELACIONES[tipo]

    return async (req, res) => {
        try {
            const result = await query(
                `SELECT t.*, u."nombre", u."apellido"
                 FROM "${tabla}" t
                 JOIN "Usuario" u ON u."id" = t."${colEmisor}"
                 WHERE t."idPaciente" = $1 AND t."estado" = 0`,
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
    const { tabla } = RELACIONES[tipo]

    return async (req, res) => {
        const { idInvitacion, aceptar } = req.body

        if (idInvitacion === undefined || typeof aceptar !== 'boolean') {
            return res.status(400).json({ message: 'Faltan parámetros requeridos (idInvitacion, aceptar: true/false)' })
        }

        try {
            const result = await query(
                `UPDATE "${tabla}" SET "estado" = $1
                 WHERE "id" = $2 AND "idPaciente" = $3 AND "estado" = 0
                 RETURNING *`,
                [aceptar ? 1 : 2, idInvitacion, req.user.id]
            )

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

async function verTareas(req, res){
const patientId = req.user.id
const result = await query("SELECT * FROM 'Tarea' WHERE idPaciente = $1", [patientId])
return (res.status(200).json({message: 'Tareas obtenidas con éxito', tareas: result.rows})
)
}

async function verRacha(req, res) {
    const patientId = req.user.id
    const result = await query("SELECT currentStreak FROM 'Paciente_Racha' WHERE idPaciente = $1", [patientId])
    if(result.rows.length === 0){
        return res.status(404).json({message: 'Racha no encontrada'})
    } else return res.status(200).json({message: 'Racha obtenida con éxito', racha: result.rows[0].currentStreak})

}

async function verDatosPaciente(req, res) {
    const patientId = req.user.id
    const result = await query("SELECT nombre, apellido, email FROM 'Usuario' WHERE id = $1 AND rol = 0", [patientId])
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
    } else {
        return res.status(200).json({ message: 'Datos obtenidos con éxito', datos: result.rows[0] });
    }
}

async function cambiarCorreo(req, res){
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'El email no es válido' })
    }

    const result = await query ("UPDATE 'Usuario' SET email = $1 WHERE id = $2 RETURNING *", [email, patientId])
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
    } else {
        return {status: 200, json: {data: "ok"}}
    }
}

module.exports = {
    createPatient, createCompanion, createDoctor, loginGeneral,
    agregarObjetos, crearTarea, completarTarea,
    enviarInvitacionAcompañante, verInvitacionesAcompañante, aceptarInvitacionAcompañante,
    enviarInvitacionDoctor, verInvitacionesDoctor, aceptarInvitacionDoctor,
    verTareas, verRacha, verDatosPaciente, cambiarCorreo
}