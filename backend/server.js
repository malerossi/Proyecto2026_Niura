require('dotenv').config()   // tiene que ir primero: db.js y cloudinary.js leen process.env al cargarse
const cors = require('cors');
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const usuariosRouter = require('./routes/usuarios.router.js')
const pacienteRouter = require('./routes/paciente.router.js')
const doctorRouter = require('./routes/doctor.router.js')
const acompananteRouter = require('./routes/acompanante.router.js')
const videoRouter = require('./routes/cloudinary.router.js')
const { verificarToken } = require('./middleware/verificarToken.js')
const { requireRol } = require('./middleware/requireRol.js')
const { initChat } = require('./sockets/chat.js')
const mensajesRouter = require('./routes/mensajes.router.js')
const PORT = process.env.PORT || 3000

const app = express()

// 1. Definir los orígenes permitidos
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()) 
  : false;

// 2. Aplicar CORS al middleware de Express (FALTABA ESTO)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const server = http.createServer(app)

// 3. Pasar la misma lista de orígenes a Socket.io
const io = new Server(server, {
    cors: { 
      origin: allowedOrigins,
      credentials: true 
    }
})

app.use(express.json())

app.use('/usuarios', usuariosRouter)

app.use('/paciente', verificarToken, requireRol(0), pacienteRouter)
app.use('/doctor', verificarToken, requireRol(2), doctorRouter)
app.use('/acompañante', verificarToken, requireRol(1), acompananteRouter)
app.use('/videos', verificarToken, requireRol(0), videoRouter)
app.use('/mensajes', verificarToken, mensajesRouter)
initChat(io)

function errorHandler(err, req, res, next) {
    console.error(err)
    const status = err.status || (err.name === 'MulterError' ? 400 : 500)
    res.status(status).json({
        message: status === 500 ? 'Error interno del servidor' : err.message
    })
}
app.use(errorHandler)

server.listen(PORT, () => {   
    console.log(`Servidor alojado en el puerto ${PORT}`)
})