const express = require('express')
const app = express()
const PORT = 3000
const {createPatient, createCompanion, createDoctor, loginGeneral, agregarObjetos, crearTarea, completarTarea, updatePatientStreak} = require('./usuarios.js')
app.use(express.json())

app.post('/usuarios/createPatient', createPatient)
app.post('/usuarios/createCompanion', createCompanion)
app.post('/usuarios/createDoctor', createDoctor)
app.post('/usuarios/loginGeneral', loginGeneral)
app.post('/usuarios/objetos/agregarObjetos', agregarObjetos)
app.post('/usuarios/tareas/crearTarea', crearTarea)
app.post('/usuarios/tareas/completarTarea', completarTarea)
app.post('/usuarios/updatePatientStreak/:id', updatePatientStreak)

function errorHandler(err, req, res, next){
res.status(500).json({message: err.message})
}

app.use(errorHandler)

app.listen(PORT, ()=>{
    console.log(`Servidor alojado en el puerto ${PORT}`)
})