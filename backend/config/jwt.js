const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET no está definido o es demasiado corto (mínimo 32 caracteres)')
}

module.exports = { JWT_SECRET, JWT_EXPIRES_IN: '12h' }