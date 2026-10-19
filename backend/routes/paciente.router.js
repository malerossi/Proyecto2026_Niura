const express = require("express")
const router = express.Router()
const { cambiarCorreo, agregarObjetos, verInvitacionesAcompañante, verInvitacionesDoctor, aceptarInvitacionAcompañante, aceptarInvitacionDoctor, completarTarea, verTareas} = require("../controllers/usuarios.js")

router.post("/agregarObjetos", agregarObjetos)
router.put("/cambiarCorreo", cambiarCorreo )
router.get("/verInvitacionesAcompañante", verInvitacionesAcompañante)
router.get("/verInvitacionesDoctor", verInvitacionesDoctor)
router.put("/aceptarInvitacionAcompañante", aceptarInvitacionAcompañante)
router.put("/aceptarInvitacionDoctor", aceptarInvitacionDoctor)
router.put("/completarTarea", completarTarea)
router.get("/verTareas", verTareas)

module.exports = router