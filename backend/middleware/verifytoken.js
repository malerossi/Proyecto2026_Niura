const jwt = require('jsonwebtoken');
const llavesupersecreta = "llavesupersecreta";
const { query } = require('./db.js');
const bcrypt = require('bcrypt');
const express = require('express');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN" o el propio token si viene directo

    const tokenAUsar = token || req.body.token;

    if (!tokenAUsar) {
        return res.status(401).json({ message: 'Token de acceso no proporcionado' });
    }

    try {
        const decoded = jwt.verify(tokenAUsar, llavesupersecreta);
        req.user = decoded; // Guardamos el payload (id, email, rol) en la request
        next();
    } catch (e) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

module.exports = { verificarToken };