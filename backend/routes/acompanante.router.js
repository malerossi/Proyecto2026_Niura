const express = require("express")
const router = express.Router()
const { cambiarCorreo, enviarInvitacionAcompañante } = require("../controllers/usuarios.js")

router.post("/enviarInvitacionAcompañante", enviarInvitacionAcompañante)
router.put("/cambiarCorreo", cambiarCorreo)

module.exports = router