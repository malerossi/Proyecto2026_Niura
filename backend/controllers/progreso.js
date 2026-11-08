const { query } = require('../db.js')
const { puedeAccederAPaciente } = require('../services/acceso.js')

async function verProgresoPaciente(req, res) {
    const { idPaciente } = req.params
    try {
        if (!(await puedeAccederAPaciente(req.user, idPaciente))) {
            return res.status(403).json({ message: 'No tenés acceso al progreso de este paciente' })
        }

        const [racha, resultados] = await Promise.all([
            query(
                `SELECT "currentStreak" FROM "Paciente_Racha" WHERE "idPaciente" = $1`,
                [idPaciente]
            ),
            query(
                `SELECT "puntaje", "creadoEn"
                 FROM "Video"
                 WHERE "idPaciente" = $1 AND "puntaje" IS NOT NULL
                 ORDER BY "creadoEn" ASC`,
                [idPaciente]
            )
        ])

        return res.status(200).json({
            racha: racha.rows[0]?.currentStreak ?? 0,
            resultados: resultados.rows.map((resultado) => ({
                puntaje: Number(resultado.puntaje),
                fecha: resultado.creadoEn
            }))
        })
    } catch (error) {
        if (error.code === '22P02') {
            return res.status(400).json({ message: 'ID de paciente inválido' })
        }
        console.error('Error al obtener el progreso del paciente:', error)
        return res.status(500).json({ message: 'No se pudo obtener el progreso del paciente' })
    }
}

module.exports = { verProgresoPaciente }
