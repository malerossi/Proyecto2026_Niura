const express = require("express")
const router = express.Router()
const { cambiarCorreo, enviarInvitacionAcompañante } = require("../controllers/usuarios.js")
const notificacionesRouter = require("./notificaciones.router.js")

router.post("/enviarInvitacionAcompañante", enviarInvitacionAcompañante)
router.post("/enviarInvitacionAcompanante", enviarInvitacionAcompañante)
router.put("/cambiarCorreo", cambiarCorreo)
router.use("/notificaciones", notificacionesRouter)

module.exports = router