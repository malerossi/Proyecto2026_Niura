const { Router } = require('express')
const { z } = require('zod')
const router = Router()


const {doctorUser, companionUser, patientUser} = require('../schemas/users.schemas')
const {createPatient, createCompanion, createDoctor, loginGeneral} = require('../services/users.services')

router.post('/patientUser', validateUser(patientUser), createPatient)
router.post('/companionUser', validateUser(companionUser), createCompanion)
router.post('/doctorUser', validateUser(doctorUser), createDoctor)
router.post('/login', validateUser(loginSchema), loginGeneral)

const  validateUser = (user) =>{
    return (req, res, next) =>{
    try{
        user.parse(req.body)
        next()
    } catch(error){
        if(error instanceof z.ZodError){
            res.status(400).json({message: 'Error de validación', errors: error.errors})
        }
    }
    
}}
module.exports = router