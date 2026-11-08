const express = require("express")
const router = express.Router()
const { subirVideoPaciente, subirAudioPaciente, listarVideosPaciente, obtenerUrlVideo, subirFotoPerfil } = require("../controllers/videocontroller.js")
const upload = require("../middleware/upload.js")
const { requireRol } = require("../middleware/requireRol.js")

router.post("/subirVideoPaciente", requireRol([0]), upload.single('video'), subirVideoPaciente)
router.post("/subirAudioPaciente", requireRol([0]), upload.single('audio'), subirAudioPaciente)
router.post("/subirFotoPerfil", requireRol([0, 1, 2]), upload.single('imagen'), subirFotoPerfil)
router.get("/paciente/:idPaciente", requireRol([0, 2]), listarVideosPaciente)
router.get("/:id/url", requireRol([0, 2]), obtenerUrlVideo)

module.exports = router