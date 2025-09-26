import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from 'path';

// Routes - Using consolidated structure
import authRoutes from "./routes/auth.js";
import billingRoutes from "./routes/billing.js";
import { healthCheck } from "./routes/health.js";
import diagnosticRoutes from "./routes/diagnostic.js";
import dbDiagnosticsRoutes from "./routes/diagnostics.js";

// Consolidated routes
import profileRoutes from "./routes/profile.js";
import clientRoutes from "./routes/clients.js";
import appointmentRoutes from "./routes/appointments-consolidated.js";
import medicalRoutes from "./routes/medical.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://veterinaria-p918.vercel.app', // Frontend URL
    'https://veterinaria-gamma-virid.vercel.app' // Backend URL (for self-calls)
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve generated PDFs and other temp assets
// In production (Vercel), files are saved in /tmp which is ephemeral
// In development, files are saved in ./tmp directory
const tmpPath = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
app.use('/tmp', express.static(tmpPath));

// Route registration - Consolidated structure
app.use("/auth", authRoutes);
app.use("/billing", billingRoutes);
app.use("/diagnostic", diagnosticRoutes);
app.use("/db", dbDiagnosticsRoutes); // Database diagnostics

// Consolidated routes
app.use("/profile", profileRoutes);
app.use("/clients", clientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/medical", medicalRoutes);

// Backward compatibility routes (deprecated - use consolidated ones)
// These maintain API compatibility but point to consolidated handlers
app.use("/tutors", clientRoutes); // Redirect to clients (tutors management)
app.use("/pets", (req, res, next) => {
  // Redirect /pets requests to /clients/:clientId/pets
  req.url = req.url.replace('/pets', '/clients/pets');
  clientRoutes(req, res, next);
});
app.use("/users", profileRoutes); // Redirect to profile
app.use("/account", profileRoutes); // Redirect to profile
app.use("/availability", appointmentRoutes); // Redirect to appointments/availability
app.use("/prescriptions", medicalRoutes); // Redirect to medical/prescriptions
app.use("/medical-records", medicalRoutes); // Redirect to medical/records
app.use("/consultation-types", appointmentRoutes); // Redirect to appointments/types

app.get("/health", healthCheck);
app.get("/", (req, res) => res.send("Backend funcionando"));

app.listen(4000, () => console.log("Backend corriendo en http://localhost:4000"));
