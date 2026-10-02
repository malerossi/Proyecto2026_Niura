const bcrypt = require('bcrypt')
const {patientUser, companionUser, doctorUser} = require('../schemas/users.schemas')

async function createPatient(name, surname, email, dni, password){
    const saltRounds = 10
    const hashed = await bcrypt.hash(password, saltRounds)
    return await query(`INSERT INTO "Paciente" (name, surname, email, dni, password) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, surname, email, dni, hashed]) 
}

async function createCompanion(name, surname, email, dni, password){
    const saltRounds = 10
    const hashed = await bcrypt.hash(password, saltRounds)
    return await query(`INSERT INTO "Companion" (name, surname, email, dni, password) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, surname, email, dni, hashed])
}

async function createDoctor(name, surname, email, dni, password, tuition){
    const saltRounds = 10
    const hashed = await bcrypt.hash(password, saltRounds)
    return await query(`INSERT INTO "Doctor" (name, surname, email, dni, password, tuition) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [name, surname, email, dni, hashed, tuition])
}

async function loginGeneral(dni, password){
    const logueado = false
    const user = await query(`SELECT * FROM "Paciente" WHERE dni = $1`, [dni])
    if(!user){
        user = await query (`SELECT * FROM "Companion" WHERE dni = $1`, [dni])
    }
    if(!user){
        user = await query(`SELECT * FROM "Doctor" WHERE dni = $1`, [dni])
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Contraseña incorrecta')
    } else{
        logueado = true
        return user
    }
}

module.exports = {createPatient, createCompanion, createDoctor, loginGeneral}
