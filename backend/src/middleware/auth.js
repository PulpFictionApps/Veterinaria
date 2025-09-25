import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log('Token recibido:', token ? 'Existe' : 'No existe');
  console.log('JWT_SECRET configurado:', process.env.JWT_SECRET ? 'Sí' : 'No');
  
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Error al verificar token:', err.message);
    res.status(401).json({ error: "Token inválido" });
  }
};
