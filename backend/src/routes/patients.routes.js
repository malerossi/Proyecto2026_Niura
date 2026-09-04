const express = require('express');
const { handleUpdateStreak } = require('../controllers/patient.controller');

const router = express.Router();

router.put('/patients/:id/streak', handleUpdateStreak);

module.exports = router;