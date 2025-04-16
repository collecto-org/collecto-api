// Middleware para verificar el token de autenticación JWT
import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No hay token de autenticación.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
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

export { verifyToken };