const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Procesa FormData

const { crearTarea, enviarInvitacionDoctor, cambiarCorreo, verTareas, verPacientesDoctor ,verPerfilDoctor, eliminarPacienteVinculado} = require("../controllers/usuarios.js");
const { verProgresoPaciente } = require("../controllers/progreso.js");
const notificacionesRouter = require("./notificaciones.router.js");

// Agregamos upload.single('video') para procesar los campos de texto y el video
router.post("/crearTarea", upload.single('video'), crearTarea);
router.post("/enviarInvitacionDoctor", enviarInvitacionDoctor);
router.put("/cambiarCorreo", cambiarCorreo);
router.get("/verPacientesDoctor", verPacientesDoctor);
router.get("/verTareas", verTareas)
router.get("/progresoPaciente/:idPaciente", verProgresoPaciente)
router.get("/verPerfilDoctor", verPerfilDoctor)
router.delete("/eliminarPacienteVinculado", eliminarPacienteVinculado)
router.use("/notificaciones", notificacionesRouter)
module.exports = router;