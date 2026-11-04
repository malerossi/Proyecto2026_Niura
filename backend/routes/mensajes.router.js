const express = require('express')
const router = express.Router()
const { historial } = require('../controllers/mensajes.js')

router.get('/:idUsuario', historial)

module.exports = router