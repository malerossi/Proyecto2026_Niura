const express = require('express')
const router = express.Router()
const {
    listarNotificaciones,
    contarNotificacionesNoLeidas,
    marcarNotificacionLeida
} = require('../controllers/notificaciones.js')

router.get('/', listarNotificaciones)
router.get('/contador', contarNotificacionesNoLeidas)
router.put('/:id/leida', marcarNotificacionLeida)

module.exports = router
