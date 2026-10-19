const express = require("express")
const router = express.Router()
const { agregarObjetos, verInvitacionesAcompañante, verInvitacionesDoctor, aceptarInvitacionAcompañante, aceptarInvitacionDoctor, completarTarea} = require("../controllers/usuarios.js")

router.post("/agregarObjetos", agregarObjetos)
router.get("/verInvitacionesAcompañante", verInvitacionesAcompañante)
router.get("/verInvitacionesDoctor", verInvitacionesDoctor)
router.put("/aceptarInvitacionAcompañante", aceptarInvitacionAcompañante)
router.put("/aceptarInvitacionDoctor", aceptarInvitacionDoctor)
router.put("/completarTarea", completarTarea)

module.exports = router