const { z } = require('zod')

const patientUser = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.string().email(),
    dni: z.string().min(8).max(8).transform(Number),
    password: z.string().min(7, "La contraseña debe tener al menos 7 caracteres"), 
    points: z.number().int(),   
    companion: z.number().int()
})

const companionUser = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.email(),
    dni: z.string().min(8).max(8).transform(Number),
    patientID: z.number().int(),
    password: z.string().min(7, "La contraseña debe tener al menos 7 caracteres")
})

const doctorUser = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.email(),
    dni: z.string().min(8).max(8).transform(Number),
    patientID: z.number().int(  ),
    password: z.string().min(7, "La contraseña debe tener al menos 7 caracteres"),
    tuition: z.number().int()
})

module.exports = {doctorUser, companionUser, patientUser}