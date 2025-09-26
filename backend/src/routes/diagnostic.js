import express from "express";

const router = express.Router();

// Endpoint de diagnóstico para verificar variables de entorno
router.get("/", (req, res) => {
  console.log("=== DATABASE DIAGNOSTIC ===");
  
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const jwtSecret = process.env.JWT_SECRET;
  
  // Ocultar contraseñas para logging seguro
  const sanitizeUrl = (url) => {
    if (!url) return "NOT_SET";
    return url.replace(/:([^@]+)@/, ":***@");
  };
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    vercel: !!process.env.VERCEL,
    databaseUrl: sanitizeUrl(dbUrl),
    directUrl: sanitizeUrl(directUrl),
    jwtSecret: jwtSecret ? "SET" : "NOT_SET",
    // Información específica de la URL
    urlAnalysis: dbUrl ? {
      host: new URL(dbUrl).hostname,
      port: new URL(dbUrl).port,
      database: new URL(dbUrl).pathname.slice(1),
      username: new URL(dbUrl).username
    } : "URL_NOT_SET"
  };
  
  console.log("Database diagnosis:", diagnosis);
  
  res.json({
    status: "Database diagnostic complete",
    ...diagnosis
  });
});

export default router;