const jwt = require('jsonwebtoken');
const {JWT_SECRET}  = require('../config/jwt.js');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const [scheme, token] = authHeader ? authHeader.split(' '): []

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Token de acceso no proporcionado' })
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
        next()
    } catch (e) {
        return res.status(401).json({ message: 'Token inválido o expirado' })
    }
}



module.exports = { verificarToken };