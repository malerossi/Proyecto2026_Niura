const express = require("express")
const router = express.Router()
const { subirVideoPaciente, listarVideosPaciente, obtenerUrlVideo } = require("../controllers/videocontroller.js")
const upload = require("../middleware/upload.js")
const { requireRol } = require("../middleware/requireRol.js")

router.post("/subirVideoPaciente", requireRol(0), upload.single('video'), subirVideoPaciente)
router.get("/paciente/:idPaciente", requireRol(0, 2), listarVideosPaciente)
router.get("/:id/url", requireRol(0, 2), obtenerUrlVideo)

module.exports = router