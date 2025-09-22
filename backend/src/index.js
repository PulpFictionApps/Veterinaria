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
app.use('/tmp', express.static(path.join(process.cwd(), 'tmp')));

app.use("/auth", authRoutes);
app.use("/tutors", tutorRoutes);
app.use("/pets", petRoutes);
app.use("/availability", availabilityRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/medical-records", medicalRecordsRoutes);

app.get("/", (req, res) => res.send("Backend funcionando"));

app.listen(4000, () => console.log("Backend corriendo en http://localhost:4000"));
