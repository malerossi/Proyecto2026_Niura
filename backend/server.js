const express = require('express')
const dotenv = require('dotenv').config()
const teamsRouter = require('./routes/teams.routes')
const playersRouter = require('./routes/players.routes')
const matchesRouter = require('./routes/matches.routes')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use('/teams', teamsRouter)
app.use('/players', playersRouter)
app.use('/matches', matchesRouter)


function errorHandler(err, req, res, next){
res.status(500).json({message: err.message})
}

app.use(errorHandler)

app.listen(PORT, ()=>{
    console.log(`Servidor alojado en el puerto ${PORT}`)
})