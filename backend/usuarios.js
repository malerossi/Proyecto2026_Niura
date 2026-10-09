const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const llavesupersecreta = "llavesupersecreta"
const { query } = require('./db.js');

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
            llavesupersecreta, 
            { expiresIn: '300h' }
        );

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
    const { token, idObjeto } = req.body;

    try {
        const idPaciente = payloadOriginal.id;

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
        console.error(e);
        return res.status(500).json({ message: 'Error interno del servidor', error: e.message });
    }
}

async function crearTarea(req, res) {
  const { token, doctorID, patientID, nombre, descripcion, objetosRequeridos } = req.body;


  try {
      const userObjectsResult = await query(
          `SELECT "objetoID", "cantidad" FROM "Paciente_Objeto" WHERE "pacienteID" = $1`,
          [patientID]
      );

      const inventarioPaciente = userObjectsResult.rows; 

      const tieneObjetosSuficientes = (objetosRequeridos || []).every(reqObj => {
          const posee = inventarioPaciente.find(inv => inv.objetoID === reqObj.objetoID);
          return posee && posee.cantidad >= reqObj.cantidad;
      });

      if (!tieneObjetosSuficientes) {
          return res.status(400).json({
              message: 'El paciente no posee los objetos o las cantidades necesarias para realizar la tarea'
          });
      }

      const tareaResult = await query(
          `INSERT INTO "Tarea" ("doctorID", "patientID", "nombre", "descripcion", "estado") 
           VALUES ($1, $2, $3, $4, 0) 
           RETURNING *`,
          [doctorID, patientID, nombre, descripcion]
      );

      const nuevaTarea = tareaResult.rows[0];

      if (objetosRequeridos && objetosRequeridos.length > 0) {
          for (const item of objetosRequeridos) {
              await query(
                  `INSERT INTO "Tarea_Objeto" ("tarea", "objeto", "cantidad") 
                   VALUES ($1, $2, $3)`,
                  [nuevaTarea.id, item.objetoID, item.cantidad]
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

    const estadoRacha = await actualizarRachaPaciente(user.id);

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

async function enviarInvitacion(req, res) {
    const { idPaciente } = req.body
    const idAcompanante = req.user.id

    if(!idPaciente){
        return res.status(400).json({message: 'Se requiere el ID del paciente'})
    }

    try {
        const pacienteCheck = await query (
            "SELECT * FROM 'Usuario' WHERE id = $1 AND rol = 0", [idPaciente]
        )
        if(pacienteCheck.rows.length === 0){
            return res.status(404).json({message: 'Paciente no encontrado'})
        }

        const relacionCheck = await query(
            "SELECT * FROM 'Acompañante_Paciente' WHERE idAcompanante = $1 AND idPaciente = $2", [idAcompanante, idPaciente]
        )
        if(relacionCheck.rows.length > 0 && relacionCheck.rows[0].estado === 0){
            return res.status(400).json({message: 'Ya le mandaste una invitación a este paciente'})
        } else if (relacionCheck.rows.length > 0 && relacionCheck.rows[0].estado === 1){
            return res.status(400).json({message: 'Ya eres acompañante de este paciente'})
        } else if (relacionCheck.rows.length === 0) {
           const result = await query(
                "INSERT INTO 'Acompañante_Paciente' (idAcompanante, idPaciente, estado) VALUES ($1, $2, 0)", [idAcompanante, idPaciente]
            )
            return res.status(200).json({message: 'Invitación enviada con éxito', invitacion: result.rows[0]}) 
            }
        } catch(e) {
        console.error(e)
        return res.status(500).json({message: 'Error interno del servidor', error: e.message})
    }
    
}
module.exports = {createPatient, createCompanion, createDoctor, loginGeneral, agregarObjetos, crearTarea, completarTarea}
