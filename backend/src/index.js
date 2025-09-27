import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from 'path';

// Routes
import authRoutes from "./routes/auth.js";
import tutorRoutes from "./routes/tutors.js";
import petRoutes from "./routes/pets.js";
import availabilityRoutes from "./routes/availability.js";
import appointmentRoutes from "./routes/appointments.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import medicalRecordsRoutes from "./routes/medicalRecords.js";
import accountRoutes from "./routes/account.js";
import billingRoutes from "./routes/billing.js";
import consultationTypesRoutes from "./routes/consultationTypes.js";
import userRoutes from "./routes/users.js";
import maintenanceRoutes from "./routes/maintenance.js";
import { healthCheck } from "./routes/health.js";
import { cleanupExpiredSlots } from "../scripts/cleanup-expired-slots.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://veterinaria-p918.vercel.app', // Frontend URL
      'https://veterinaria-gamma-virid.vercel.app', // Backend URL (for self-calls)
      'http://localhost:3000', // Local development
      'http://localhost:3001', // Alternative local port
      // Permitir cualquier subdominio de vercel.app para flexibilidad
      /^https:\/\/.*\.vercel\.app$/
    ];
    
    // Permitir requests sin origin (ej: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está permitido
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware adicional para headers CORS
app.use((req, res, next) => {
  // Permitir headers adicionales
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Serve generated PDFs and other temp assets
// In production (Vercel), files are saved in /tmp which is ephemeral
// In development, files are saved in ./tmp directory
const tmpPath = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
app.use('/tmp', express.static(tmpPath));

app.use("/auth", authRoutes);
app.use("/tutors", tutorRoutes);
app.use("/pets", petRoutes);
app.use("/availability", availabilityRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/medical-records", medicalRecordsRoutes);
app.use("/account", accountRoutes);
app.use("/billing", billingRoutes);
app.use("/consultation-types", consultationTypesRoutes);
app.use("/users", userRoutes);
app.use("/maintenance", maintenanceRoutes);

app.get("/health", healthCheck);
app.get("/", (req, res) => res.send("Backend funcionando"));

// Configurar cleanup automático de horarios expirados
// Ejecutar cada 30 minutos
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutos en millisegundos

// Ejecutar primera limpieza al iniciar el servidor
setTimeout(async () => {
  try {
    console.log('🧹 Ejecutando limpieza inicial de horarios expirados...');
    await cleanupExpiredSlots();
  } catch (error) {
    console.error('❌ Error en limpieza inicial:', error);
  }
}, 5000); // Esperar 5 segundos después del inicio

// Configurar limpieza periódica
setInterval(async () => {
  try {
    console.log('🔄 Ejecutando limpieza periódica de horarios expirados...');
    await cleanupExpiredSlots();
  } catch (error) {
    console.error('❌ Error en limpieza periódica:', error);
  }
}, CLEANUP_INTERVAL);

app.listen(4000, () => {
  console.log("Backend corriendo en http://localhost:4000");
  console.log(`🕒 Limpieza automática configurada cada ${CLEANUP_INTERVAL / (60 * 1000)} minutos`);
});
