const express = require('express')
const app = express()
const PORT = 3000
const usuariosRouter = require("./routes/usuarios.router.js")
const pacienteRouter = require("./routes/paciente.router.js")
const doctorRouter = require("./routes/doctor.router.js")
const acompananteRouter = require("./routes/acompanante.router.js")
const {verificarToken} = require("./middleware/verifytoken.js")

const upload = require("./middleware/upload.js")
const videoRouter = require("./routes/cloudinary.router.js")
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json())
app.use(express.static('public'));


app.use("/usuarios", verificarToken, usuariosRouter)
app.use("/paciente", verificarToken, pacienteRouter)
app.use("/doctor", verificarToken, doctorRouter)
app.use("/acompañante", verificarToken, acompananteRouter)
app.use("/videos", verificarToken, videoRouter)




app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`> Usuario conectado: ${socket.id}`);

    socket.on('registrar_usuario', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Usuario ${userId} se unió a su sala privada: user_${userId}`);
    });

    socket.on('enviar_mensaje_privado', async (data) => {
        try {
            const query = `
                INSERT INTO "Mensaje" (contenido, fecha, remitente, receptor) 
                VALUES ($1, CURRENT_TIMESTAMP, $2, $3) 
                RETURNING id, contenido, fecha, remitente, receptor;
            `;
            const values = [data.contenido, data.remitenteId, data.receptorId];

            const mensajeGuardado = {
                id: Date.now(),
                contenido: data.contenido,
                fecha: new Date(),
                remitente: data.remitenteId,
                receptor: data.receptorId
            };

            io.to(`user_${data.receptorId}`).emit('recibir_mensaje_privado', mensajeGuardado);

            socket.emit('recibir_mensaje_privado', mensajeGuardado);

        } catch (err) {
            console.error('> Error al guardar mensaje privado:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`> Usuario desconectado: ${socket.id}`);
    });
});



function errorHandler(err, req, res, next){
res.status(500).json({message: err.message})
}

app.use(errorHandler)

app.listen(PORT, ()=>{
    console.log(`Servidor alojado en el puerto ${PORT}`)
})