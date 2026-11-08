function requireRol(roles) {
  return function (req, res, next) {
    // Convierte a Array si le pasas un número suelto (ej: 0 -> [0])
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    // Se verifica req.user.rol (sin la 'e')
    if (!req.user || !rolesArray.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    next();
  };
}

module.exports = {requireRol}; // Exportación directa