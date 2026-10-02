const { patientUser : patientUserSchema } = require('../schemas/users.schemas');

async function updatePatientStreak(patientId) {
  const patient = await query(`SELECT * FROM "Paciente" WHERE id = $1`, [patientId]);

  if (!patient) {
    throw new Error(`No se encontró el paciente con ID ${patientId}`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastUpdate = patient.lastStreakUpdate
    ? new Date(patient.lastStreakUpdate)
    : null;

  if (lastUpdate) {
    lastUpdate.setHours(0, 0, 0, 0);
  }

  const diffTime = lastUpdate ? today.getTime() - lastUpdate.getTime() : null;
  const diffDays = diffTime !== null ? Math.round(diffTime / (1000 * 60 * 60 * 24)) : null;

  let newCurrentStreak = patient.currentStreak;

  if (diffDays === 0) {
    return {
      updated: false,
      message: 'La racha ya fue registrada el día de hoy.',
      patient,
    };
  } else if (diffDays === 1) {
    newCurrentStreak += 1;
  } else {
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(newCurrentStreak, patient.longestStreak);

  const updatedPatient = await query("UPDATE Paciente SET currentStreak = $1, longestStreak = $2, lastStreakUpdate = $3 WHERE id = $4", [newCurrentStreak, newLongestStreak, today, patientId]);

  return {
    updated: true,
    message: 'Racha actualizada con éxito.',
    patient: updatedPatient,
  };
}

async function createPatientUser(data) {
  const validatedData = patientUserSchema.parse(data);

  const newPatient = await query("INSERT INTO Paciente (name, surname, email, dni, password) VALUES ($1, $2, $3, $4, $5) RETURNING *", [validatedData.name, validatedData.surname, validatedData.email, validatedData.dni, validatedData.password]);

  return newPatient;
}

module.exports = { updatePatientStreak, createPatientUser };