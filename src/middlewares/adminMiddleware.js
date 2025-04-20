// Middleware que asegura que solo los administradores puedan acceder a ciertas rutas
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' });
};

export default verifyAdmin;
