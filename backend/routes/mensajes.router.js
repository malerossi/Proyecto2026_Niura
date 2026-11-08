<<<<<<< HEAD
const express = require('express')
const router = express.Router()
const { historial } = require('../controllers/mensajes.js')

router.get('/:idUsuario', historial)

module.exports = router
=======
const express = require('express');
const router = express.Router();
const { historial, listarContactos, enviarMensaje } = require('../controllers/mensajes.js');
const { verificarToken } = require('../middleware/verificarToken.js'); // Tu middleware de sesión JWT

router.use(verificarToken);

router.get('/contactos', listarContactos);
router.get('/historial/:idUsuario', historial);
router.post('/enviar', enviarMensaje);

module.exports = router;
>>>>>>> 21f0353bc8a56af3d9a2ff7a970e2ea0f5c383cf
