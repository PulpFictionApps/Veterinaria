import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from 'path';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from "./routes/auth.js";
import tutorRoutes from "./routes/tutors.js";
import petRoutes from "./routes/pets.js";
import availabilityRoutes from "./routes/availability.js";
import appointmentRoutes from "./routes/appointments.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import prescriptionOptimizedRoutes from "./routes/prescriptions-optimized-es6.js";
import prescriptionHybridRoutes from "./routes/prescriptions-hybrid-optimized.js";
import medicalRecordsRoutes from "./routes/medicalRecords.js";
import accountRoutes from "./routes/account.js";
import billingRoutes from "./routes/billing.js";
import consultationTypesRoutes from "./routes/consultationTypes.js";
import userRoutes from "./routes/users.js";
import maintenanceRoutes from "./routes/maintenance.js";
import reminderRoutes from "./routes/reminders.js";
import { healthCheck } from "./routes/health.js";
import { cleanupExpiredSlots } from "../scripts/cleanup-expired-slots.js";
import { processReminders } from "./lib/reminderService.js";

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
// parse cookies for auth middleware
app.use(cookieParser());

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
app.use("/prescriptions", prescriptionOptimizedRoutes); // Sistema optimizado con acceso perpetuo
app.use("/prescriptions", prescriptionHybridRoutes); // Sistema híbrido: Supabase + Cache + Metadatos
app.use("/medical-records", medicalRecordsRoutes);
app.use("/account", accountRoutes);
app.use("/billing", billingRoutes);
app.use("/consultation-types", consultationTypesRoutes);
app.use("/users", userRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/reminders", reminderRoutes);

app.get("/health", healthCheck);
app.get("/", (req, res) => res.send("Backend funcionando"));

// Configurar cleanup automático de horarios expirados
// Ejecutar alineado cada 15 minutos (en :00, :15, :30, :45) usando hora de servidor
const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutos

// Función helper para calcular ms hasta el próximo cuarto (según hora del servidor)
function msUntilNextQuarter() {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextQuarter = Math.ceil((minutes + 0.000001) / 15) * 15; // 15,30,45,60
  const target = new Date(now);
  if (nextQuarter === 60) {
    target.setHours(now.getHours() + 1);
    target.setMinutes(0);
  } else {
    target.setMinutes(nextQuarter);
  }
  target.setSeconds(0);
  target.setMilliseconds(0);
  return target.getTime() - now.getTime();
}

// Programar la primera ejecución alineada al siguiente cuarto
setTimeout(async () => {
  try {
    console.log('🧹 Ejecutando limpieza inicial de horarios expirados (alineada al cuarto)');
    await cleanupExpiredSlots();
  } catch (error) {
    console.error('❌ Error en limpieza inicial:', error);
  }

  // Después de la primera ejecución alineada, ejecutar periódicamente cada 15 minutos
  setInterval(async () => {
    try {
      console.log('🔄 Ejecutando limpieza periódica de horarios expirados...');
      await cleanupExpiredSlots();
    } catch (error) {
      console.error('❌ Error en limpieza periódica:', error);
    }
  }, CLEANUP_INTERVAL);

}, msUntilNextQuarter());

// Configurar sistema de recordatorios automáticos
// Ejecutar cada 10 minutos para verificar recordatorios pendientes
const REMINDER_INTERVAL = 10 * 60 * 1000; // 10 minutos

// Ejecutar primera verificación de recordatorios al iniciar el servidor
setTimeout(async () => {
  try {
    console.log('📧 Ejecutando verificación inicial de recordatorios...');
    await processReminders();
  } catch (error) {
    console.error('❌ Error en verificación inicial de recordatorios:', error);
  }
}, 10000); // Esperar 10 segundos después del inicio

// Configurar verificación periódica de recordatorios
setInterval(async () => {
  try {
    console.log('🔄 Ejecutando verificación periódica de recordatorios...');
    await processReminders();
  } catch (error) {
    console.error('❌ Error en verificación periódica de recordatorios:', error);
  }
}, REMINDER_INTERVAL);

app.listen(4000, () => {
  console.log("Backend corriendo en http://localhost:4000");
  console.log(`🕒 Limpieza automática configurada cada ${CLEANUP_INTERVAL / (60 * 1000)} minutos`);
  console.log(`📧 Recordatorios automáticos configurados cada ${REMINDER_INTERVAL / (60 * 1000)} minutos`);
});
