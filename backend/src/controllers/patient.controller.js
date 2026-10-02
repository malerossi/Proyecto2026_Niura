const { updatePatientStreak, createPatientUser } = require('../services/patient.services');
async function handleUpdateStreak(req, res) {
  try {
    const patientId = parseInt(req.params.id, 10);
    const result = await updatePatientStreak(patientId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function handleCreatePatient(req, res) {
  try {
    const newPatient = await createPatientUser(req.body);
    return res.status(201).json(newPatient);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}


module.exports = {
  handleUpdateStreak, handleCreatePatient,
};