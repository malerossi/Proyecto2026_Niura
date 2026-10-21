const jwt = require('jsonwebtoken');
const llavesupersecreta = "llavesupersecreta";
const { query } = require('../db');
const bcrypt = require('bcrypt');
const express = require('express');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    const tokenAUsar = token || req.body.token;

    if (!tokenAUsar) {
        return res.status(401).json({ message: 'Token de acceso no proporcionado' });
    }

    try {
        const decoded = jwt.verify(tokenAUsar, llavesupersecreta);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

module.exports = { verificarToken };