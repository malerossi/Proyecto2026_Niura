const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePatientStreak(patientId) {
  const patient = await prisma.patientUser.findUnique({
    where: { id: patientId },
  });

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

  const updatedPatient = await prisma.patientUser.update({
    where: { id: patientId },
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastStreakUpdate: today,
    },
  });

  return {
    updated: true,
    message: 'Racha actualizada con éxito.',
    patient: updatedPatient,
  };
}

module.exports = { updatePatientStreak };