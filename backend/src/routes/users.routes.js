const { Router } = require('express')
const { z } = require('zod')
const router = Router()


const {patientUser, companionUser, doctorUser} = require('../schemas/users.schemas')
const {postPatient} = require('../controllers/users.controller')

router.post('/patientUser', validateUser(patientUser), postPatient)
router.post('/companionUser', validateUser(companionUser), postUser)
router.post('/doctorUser', validateUser(doctorUser), postUser)

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