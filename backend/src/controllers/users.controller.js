const Prisma = require('../db')
const User = require('../schemas/users.schemas')
const Services = require('../services/users.services')

async function postPatient(req, res) {
    const {name, surname, email, dni, password} = req.body
    const patient = await Services.createPatient(name, surname, email, dni, password)
res.status(201).json({message: patient})
}

module.exports = {postPatient}