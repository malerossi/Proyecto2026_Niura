const express = require("express")
const router = express.Router()
const { createPatient, createCompanion, createDoctor, loginGeneral} = require("../controllers/usuarios.js")

router.post("/paciente",  createPatient)
router.post("/acompañante",  createCompanion)
router.post("/doctor",  createDoctor)
router.post("/login",  loginGeneral)

module.exports = router