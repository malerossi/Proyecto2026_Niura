const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Procesa FormData

const { crearTarea, enviarInvitacionDoctor, cambiarCorreo, verTareas } = require("../controllers/usuarios.js");

// Agregamos upload.single('video') para procesar los campos de texto y el video
router.post("/crearTarea", upload.single('video'), crearTarea);
router.post("/enviarInvitacionDoctor", enviarInvitacionDoctor);
router.put("/cambiarCorreo", cambiarCorreo);
router.get("/verTareas", verTareas)
module.exports = router;