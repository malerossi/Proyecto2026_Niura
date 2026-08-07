const { z } = require('zod')

const patientUser = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.email(),
    dni: z.string().min(8).max(8).transform(number),
    password: z.string().min(7, "La contraseña debe tener al menos 7 caracteres"), 
    points: z.number().int()
})

const companionUser = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.email(),
    dni: z.string().min(8).max(8).transform(number),
    patientName: z.string(),
    patientSurname: z.string(),
    patientDNI: z.string().min(8).max(8).transform(number),
    password: z.string().min(7, "La contraseña debe tener al menos 7 caracteres")
})

const doctorUser = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.email(),
    dni: z.string().min(8).max(8).transform(number),
    patientName: z.string(),
    patientSurname: z.string(),
    patientDNI: z.string().min(8).max(8).transform(number),
    password: z.string().min(7, "La contraseña debe tener al menos 7 caracteres"),
    tuition: z.number().int()
})