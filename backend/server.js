const express = require('express')
const dotenv = require('dotenv').config()
const patientsRouter = require('./src/routes/patients.routes')
const usersRouter = require('./src/routes/users.routes')
const app = express()
const PORT = 3000

app.use(express.json())
app.use('/patients', patientsRouter)
app.use('/users', usersRouter)


function errorHandler(err, req, res, next){
res.status(500).json({message: err.message})
}

app.use(errorHandler)

app.listen(PORT, ()=>{
    console.log(`Servidor alojado en el puerto ${PORT}`)
})