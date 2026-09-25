const express = require('express')
const { handleUpdateStreak, handleCreatePatient } = require('../controllers/patient.controller');

const router = express.Router();

router.post('/', handleCreatePatient);
router.put('/:id/streak', handleUpdateStreak);

module.exports = router;