const express = require("express")
const router = express.Router()
const { cambiarCorreo, agregarObjetos, verInvitacionesAcompañante, verInvitacionesDoctor, aceptarInvitacionAcompañante, aceptarInvitacionDoctor, completarTarea, verTareasPaciente, verRacha, verDatosPaciente} = require("../controllers/usuarios.js")

router.get("/verDatosPaciente", verDatosPaciente)
router.get("/verRacha", verRacha)
router.get("/verTareas", verTareasPaciente)
router.post("/agregarObjetos", agregarObjetos)
router.put("/cambiarCorreo", cambiarCorreo )
router.get("/verInvitacionesAcompañante", verInvitacionesAcompañante)
router.get("/verInvitacionesAcompanante", verInvitacionesAcompañante)
router.get("/verInvitacionesDoctor", verInvitacionesDoctor)
router.put("/aceptarInvitacionAcompañante", aceptarInvitacionAcompañante)
router.put("/aceptarInvitacionAcompanante", aceptarInvitacionAcompañante)
router.put("/aceptarInvitacionDoctor", aceptarInvitacionDoctor)
router.put("/completarTarea", completarTarea)


module.exports = router