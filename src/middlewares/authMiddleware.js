import jwt from 'jsonwebtoken';

// Middleware para verificar el token de autenticación JWT
function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No hay token de autenticación.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'El token de autenticación ha expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token de autenticación inválido.' });
    }
    return res.status(401).json({ error: 'No autorizado.' });
  }
}

// Middleware para cargar la información del usuario si está autenticado
function loadUserIfAuthenticated(req, res, next) {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      console.error('Token inválido o expirado:', error.message);
      return res.status(401).json({ error: 'Token inválido o expirado. Por favor, vuelve a iniciar sesión.' });
    }
  }
  next();
}

export { verifyToken, loadUserIfAuthenticated };
