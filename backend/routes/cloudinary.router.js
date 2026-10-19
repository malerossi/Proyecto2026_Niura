const express = require("express")
const router = express.Router()
const {subirVideoPaciente} = require("../controllers/videocontroller.js")
const upload = require("../middleware/upload.js")

router.post("/subirVideoPaciente", upload.single('video'), subirVideoPaciente)