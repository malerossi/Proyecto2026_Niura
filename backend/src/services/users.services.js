const Prisma = require('../db')
const {patientUser, companionUser, doctorUser} = require('../schemas/users.schemas')

async function createPatient(name, surname, email, dni, password){
    return await Prisma.patientUser.create({
        data: {
            name: name,
            surname: surname,
            email: email,
            dni: dni,
            password: password,
            companion: null,
            points: 0
            }
        }
    )
}

async function createCompanion(name, surname, email, dni, password){
    return await Prisma.companionUser.create({
        data: {
            name: name,
            surname: surname,
            email: email,
            dni: dni,
            password: password,
            patientID: null,
            }
        }
    )
}

async function createDoctor(name, surname, email, dni, password, tuition){
    return await Prisma.doctorUser.create({
        data: {
            name: name,
            surname: surname,
            email: email,
            dni: dni,
            password: password,
            patientID: null,
            tuition: tuition
            }
        }
    )
}

module.exports = {createPatient, createCompanion, createDoctor}