const express = require("express")
const router = express.Router()
const { crearTarea, enviarInvitacionDoctor} = require("../controllers/usuarios.js")

router.post("/crearTarea", crearTarea)
router.post("/enviarInvitacionDoctor", enviarInvitacionDoctor)