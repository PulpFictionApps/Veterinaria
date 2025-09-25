import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = express.Router();

// ===========================
// MEDICAL RECORDS MANAGEMENT
// ===========================

// GET /medical/records - Get all medical records for user
router.get("/records", verifyToken, async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: {
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ error: 'Error fetching medical records' });
  }
});

// GET /medical/records/:petId - Get medical records for specific pet
router.get("/records/:petId", verifyToken, async (req, res) => {
  try {
    const petId = Number(req.params.petId);
    
    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        tutor: {
          userId: req.user.id
        }
      }
    });
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const records = await prisma.medicalRecord.findMany({
      where: { petId },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    res.json(records);
  } catch (err) {
    console.error('Error fetching pet medical records:', err);
    res.status(500).json({ error: 'Error fetching medical records' });
  }
});

// POST /medical/records - Create medical record
router.post("/records", verifyToken, async (req, res) => {
  try {
    const { petId, date, diagnosis, treatment, notes, weight, temperature } = req.body;
    
    if (!petId) {
      return res.status(400).json({ error: 'petId is required' });
    }
    
    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: Number(petId),
        tutor: {
          userId: req.user.id
        }
      }
    });
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const record = await prisma.medicalRecord.create({
      data: {
        petId: Number(petId),
        date: date ? new Date(date) : new Date(),
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        notes: notes || null,
        weight: weight ? Number(weight) : null,
        temperature: temperature ? Number(temperature) : null
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      }
    });
    
    res.json(record);
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(500).json({ error: 'Error creating medical record' });
  }
});

// PATCH /medical/records/:id - Update medical record
router.patch("/records/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { date, diagnosis, treatment, notes, weight, temperature } = req.body;
    
    // Verify record belongs to user
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        id,
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      }
    });
    
    if (!existingRecord) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        diagnosis: diagnosis !== undefined ? diagnosis : undefined,
        treatment: treatment !== undefined ? treatment : undefined,
        notes: notes !== undefined ? notes : undefined,
        weight: weight !== undefined ? (weight ? Number(weight) : null) : undefined,
        temperature: temperature !== undefined ? (temperature ? Number(temperature) : null) : undefined
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      }
    });
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating medical record:', err);
    res.status(500).json({ error: 'Error updating medical record' });
  }
});

// DELETE /medical/records/:id - Delete medical record
router.delete("/records/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Verify record belongs to user
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        id,
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      }
    });
    
    if (!existingRecord) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    await prisma.medicalRecord.delete({
      where: { id }
    });
    
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    console.error('Error deleting medical record:', err);
    res.status(500).json({ error: 'Error deleting medical record' });
  }
});

// ===========================
// PRESCRIPTIONS MANAGEMENT
// ===========================

// GET /medical/prescriptions - Get all prescriptions for user
router.get("/prescriptions", verifyToken, async (req, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Error fetching prescriptions' });
  }
});

// GET /medical/prescriptions/:petId - Get prescriptions for specific pet
router.get("/prescriptions/:petId", verifyToken, async (req, res) => {
  try {
    const petId = Number(req.params.petId);
    
    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        tutor: {
          userId: req.user.id
        }
      }
    });
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const prescriptions = await prisma.prescription.findMany({
      where: { petId },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching pet prescriptions:', err);
    res.status(500).json({ error: 'Error fetching prescriptions' });
  }
});

// POST /medical/prescriptions - Create prescription
router.post("/prescriptions", verifyToken, async (req, res) => {
  try {
    const { petId, medications, diagnosis, instructions } = req.body;
    
    if (!petId || !medications || !Array.isArray(medications)) {
      return res.status(400).json({ error: 'petId and medications array are required' });
    }
    
    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: Number(petId),
        tutor: {
          userId: req.user.id
        }
      }
    });
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const prescription = await prisma.prescription.create({
      data: {
        petId: Number(petId),
        medications: JSON.stringify(medications),
        diagnosis: diagnosis || null,
        instructions: instructions || null,
        userId: req.user.id
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      }
    });
    
    res.json(prescription);
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: 'Error creating prescription' });
  }
});

// GET /medical/prescriptions/:id/pdf - Generate PDF for prescription
router.get("/prescriptions/:id/pdf", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Get prescription with related data
    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        },
        user: {
          select: {
            professionalRut: true,
            professionalTitle: true,
            clinicAddress: true,
            professionalPhone: true,
            licenseNumber: true,
            signatureUrl: true,
            logoUrl: true,
            clinicName: true,
            fullName: true
          }
        }
      }
    });
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const tmpPath = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
    
    // Ensure tmp directory exists
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
    
    const filename = `prescription-${id}-${Date.now()}.pdf`;
    const filepath = path.join(tmpPath, filename);
    const stream = fs.createWriteStream(filepath);
    
    doc.pipe(stream);
    
    // Header
    const professional = prescription.user;
    const clinicName = professional?.clinicName || 'Clínica Veterinaria';
    const professionalName = professional?.fullName || 'Veterinario';
    const professionalTitle = professional?.professionalTitle || 'Médico Veterinario';
    
    doc.fontSize(18).text(clinicName, { align: 'center' });
    doc.fontSize(12).text(professionalTitle, { align: 'center' });
    doc.fontSize(12).text(professionalName, { align: 'center' });
    
    if (professional?.professionalRut) {
      doc.text(`RUT: ${professional.professionalRut}`, { align: 'center' });
    }
    
    if (professional?.clinicAddress) {
      doc.text(professional.clinicAddress, { align: 'center' });
    }
    
    doc.moveDown(2);
    
    // Prescription details
    doc.fontSize(16).text('RECETA MÉDICA', { align: 'center', underline: true });
    doc.moveDown();
    
    doc.fontSize(12).text(`Fecha: ${new Date(prescription.createdAt).toLocaleDateString('es-ES')}`);
    doc.text(`Paciente: ${prescription.pet.name} (${prescription.pet.type})`);
    doc.text(`Tutor: ${prescription.pet.tutor.name}`);
    
    if (prescription.diagnosis) {
      doc.moveDown().text(`Diagnóstico: ${prescription.diagnosis}`);
    }
    
    doc.moveDown().fontSize(14).text('MEDICAMENTOS:', { underline: true });
    
    const medications = JSON.parse(prescription.medications);
    medications.forEach((med, index) => {
      doc.fontSize(12).text(`${index + 1}. ${med.name}`);
      if (med.dosage) doc.text(`   Dosis: ${med.dosage}`);
      if (med.frequency) doc.text(`   Frecuencia: ${med.frequency}`);
      if (med.duration) doc.text(`   Duración: ${med.duration}`);
      doc.moveDown(0.5);
    });
    
    if (prescription.instructions) {
      doc.moveDown().fontSize(14).text('INSTRUCCIONES:', { underline: true });
      doc.fontSize(12).text(prescription.instructions);
    }
    
    // Footer with signature
    doc.moveDown(2);
    if (professional?.signatureUrl) {
      // Add signature image if available
      // This would require implementing image download/processing
      doc.text('_________________________');
      doc.text(`${professionalName}`);
      doc.text(professionalTitle);
    } else {
      doc.text('_________________________');
      doc.text(`${professionalName}`);
      doc.text(professionalTitle);
    }
    
    if (professional?.licenseNumber) {
      doc.text(`Col. Nº ${professional.licenseNumber}`);
    }
    
    doc.end();
    
    stream.on('finish', () => {
      res.json({
        success: true,
        filename,
        downloadUrl: `/tmp/${filename}`,
        message: 'PDF generado exitosamente'
      });
    });
    
    stream.on('error', (error) => {
      console.error('Error writing PDF:', error);
      res.status(500).json({ error: 'Error generating PDF' });
    });
    
  } catch (err) {
    console.error('Error generating prescription PDF:', err);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

// PATCH /medical/prescriptions/:id - Update prescription
router.patch("/prescriptions/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { medications, diagnosis, instructions } = req.body;
    
    // Verify prescription belongs to user
    const existingPrescription = await prisma.prescription.findFirst({
      where: {
        id,
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      }
    });
    
    if (!existingPrescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        medications: medications ? JSON.stringify(medications) : undefined,
        diagnosis: diagnosis !== undefined ? diagnosis : undefined,
        instructions: instructions !== undefined ? instructions : undefined
      },
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      }
    });
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating prescription:', err);
    res.status(500).json({ error: 'Error updating prescription' });
  }
});

// DELETE /medical/prescriptions/:id - Delete prescription
router.delete("/prescriptions/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Verify prescription belongs to user
    const existingPrescription = await prisma.prescription.findFirst({
      where: {
        id,
        pet: {
          tutor: {
            userId: req.user.id
          }
        }
      }
    });
    
    if (!existingPrescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    await prisma.prescription.delete({
      where: { id }
    });
    
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('Error deleting prescription:', err);
    res.status(500).json({ error: 'Error deleting prescription' });
  }
});

export default router;