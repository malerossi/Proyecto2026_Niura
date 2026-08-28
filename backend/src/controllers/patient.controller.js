const { updatePatientStreak } = require('../services/patientService');

async function handleUpdateStreak(req, res) {
  try {
    const patientId = parseInt(req.params.id, 10);
    const result = await updatePatientStreak(patientId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleUpdateStreak,
};