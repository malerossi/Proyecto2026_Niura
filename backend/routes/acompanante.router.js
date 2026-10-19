const express = require("express")
const router = express.Router()
const { enviarInvitacionAcompañante } = require("../controllers/usuarios.js")

router.post("/enviarInvitacionAcompañante", enviarInvitacionAcompañante)