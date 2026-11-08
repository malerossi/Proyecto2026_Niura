const express = require('express');
const router = express.Router();
const { historial, listarContactos, enviarMensaje } = require('../controllers/mensajes.js');
const { verificarToken } = require('../middleware/verificarToken.js'); // Tu middleware de sesión JWT

router.use(verificarToken);

router.get('/contactos', listarContactos);
router.get('/historial/:idUsuario', historial);
router.post('/enviar', enviarMensaje);

module.exports = router;
