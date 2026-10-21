const express = require("express")
const router = express.Router()
const { crearTarea, enviarInvitacionDoctor, cambiarCorreo} = require("../controllers/usuarios.js")

router.post("/crearTarea", crearTarea)
router.post("/enviarInvitacionDoctor", enviarInvitacionDoctor)
router.put("/cambiarCorreo", cambiarCorreo)

module.exports = router