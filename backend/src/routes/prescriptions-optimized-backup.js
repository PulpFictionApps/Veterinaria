// Implementación híbrida optimizada para Neon - Acceso perpetuo garantizado
const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configuración de almacenamiento multinivel para acceso perpetuo
const TEMP_PDF_DIR = path.join(__dirname, '../../../tmp/pdfs');
const CACHE_PDF_DIR = path.join(__dirname, '../../../tmp/cache'); 
const ARCHIVE_PDF_DIR = path.join(__dirname, '../../../archive/pdfs');

// Configuración de retención inteligente
const IMMEDIATE_CLEANUP_HOURS = 2;   // Temp: 2 horas
const CACHE_DAYS = 30;               // Cache: 30 días para recetas frecuentes
const EXTENDED_CACHE_DAYS = 90;      // Cache extendido: 90 días para recetas usadas

// Estadísticas en memoria para decisiones inteligentes
const pdfStats = new Map();
global.downloadTokens = global.downloadTokens || new Map();

// Asegurar todos los directorios necesarios
async function ensureDirectories() {
  try {
    await Promise.all([
      fs.mkdir(TEMP_PDF_DIR, { recursive: true }),
      fs.mkdir(CACHE_PDF_DIR, { recursive: true }),
      fs.mkdir(ARCHIVE_PDF_DIR, { recursive: true })
    ]);
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Limpieza multinivel inteligente
async function smartCleanup() {
  try {
    const now = Date.now();
    
    // 1. Limpiar archivos temporales (2 horas)
    const tempFiles = await fs.readdir(TEMP_PDF_DIR).catch(() => []);
    for (const file of tempFiles) {
      if (!file.endsWith('.pdf')) continue;
      
      const filePath = path.join(TEMP_PDF_DIR, file);
      const stats = await fs.stat(filePath).catch(() => null);
// Buscar PDF existente en cualquier nivel de almacenamiento
async function findExistingPDF(prescriptionId) {
  const fileName = `${prescriptionId}.pdf`;
  
  // 1. Buscar en caché
  try {
    const cachePath = path.join(CACHE_PDF_DIR, fileName);
    await fs.access(cachePath);
    return { path: cachePath, level: 'cache' };
  } catch {}
  
  // 2. Buscar en archivo histórico
  try {
    const archivePath = path.join(ARCHIVE_PDF_DIR, fileName);
    await fs.access(archivePath);
    return { path: archivePath, level: 'archive' };
  } catch {}
  
  return null;
}

// Generar PDF profesional mejorado
async function generateEnhancedPDF(prescription, user, isHistorical = false) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 800;
  
  // Header profesional con indicador de documento histórico
  const headerColor = isHistorical ? rgb(0.7, 0.4, 0.1) : rgb(0.2, 0.4, 0.8);
  
  page.drawRectangle({
    x: 40,
    y: yPosition - 10,
    width: 515,
    height: 80,
    color: rgb(0.97, 0.97, 0.97),
  });
  
  page.drawText('RECETA VETERINARIA', {
    x: 50,
    y: yPosition + 30,
    size: 22,
    font: boldFont,
    color: headerColor
  });

  if (isHistorical) {
    page.drawText('DOCUMENTO HISTÓRICO', {
      x: 320,
      y: yPosition + 30,
      size: 10,
      font: boldFont,
      color: rgb(0.8, 0.4, 0.1)
    });
  }
  
  page.drawText(`N° ${prescription.id.toString().padStart(8, '0')}`, {
    x: 420,
    y: yPosition + 5,
    size: 14,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4)
  });

  yPosition -= 100;

  // Información de la clínica
  page.drawText(`${user.clinicName || 'Clínica Veterinaria'}`, {
    x: 50,
    y: yPosition,
    size: 16,
    font: boldFont
  });

  yPosition -= 25;
  page.drawText(`Médico Veterinario: ${user.fullName || 'Dr./Dra. Veterinario/a'}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font
  });

  if (user.email) {
    yPosition -= 18;
    page.drawText(`Contacto: ${user.email}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  // Línea separadora
  yPosition -= 30;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 2,
    color: headerColor
  });

  // Información del paciente
  yPosition -= 40;
  page.drawRectangle({
    x: 50,
    y: yPosition - 5,
    width: 495,
    height: 25,
    color: rgb(0.95, 0.95, 0.95)
  });
  
  page.drawText('INFORMACIÓN DEL PACIENTE', {
    x: 55,
    y: yPosition + 5,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3)
  });

  yPosition -= 35;
  
  page.drawText(`Paciente: ${prescription.pet.name}`, {
    x: 60,
    y: yPosition,
    size: 12,
    font: boldFont
  });

  if (prescription.pet.type) {
    page.drawText(`Especie: ${prescription.pet.type}`, {
      x: 320,
      y: yPosition,
      size: 12,
      font: font
    });
  }

  yPosition -= 20;
  page.drawText(`Propietario: ${prescription.pet.tutor.name}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: font
  });

  if (prescription.pet.tutor.phone) {
    page.drawText(`Tel: ${prescription.pet.tutor.phone}`, {
      x: 320,
      y: yPosition,
      size: 11,
      font: font
    });
  }

  yPosition -= 25;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });

  // Prescripción
  yPosition -= 35;
  page.drawRectangle({
    x: 50,
    y: yPosition - 5,
    width: 495,
    height: 25,
    color: rgb(0.95, 0.95, 0.95)
  });
  
  page.drawText(prescription.title.toUpperCase(), {
    x: 55,
    y: yPosition + 5,
    size: 14,
    font: boldFont,
    color: headerColor
  });

  // Medicamentos
  yPosition -= 40;
  const medications = JSON.parse(prescription.medications);
  
  medications.forEach((med, index) => {
    yPosition -= 10;
    page.drawRectangle({
      x: 60,
      y: yPosition - 35,
      width: 475,
      height: 40,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1
    });

    page.drawText(`${index + 1}`, {
      x: 70,
      y: yPosition - 10,
      size: 14,
      font: boldFont,
      color: headerColor
    });

    page.drawText(med.name.toUpperCase(), {
      x: 90,
      y: yPosition - 10,
      size: 12,
      font: boldFont
    });
    
    yPosition -= 25;
    page.drawText(`Dosis: ${med.dose}`, {
      x: 90,
      y: yPosition,
      size: 10,
      font: font
    });
    
    page.drawText(`Frecuencia: ${med.frequency}`, {
      x: 280,
      y: yPosition,
      size: 10,
      font: font
    });

    if (med.duration) {
      page.drawText(`Duración: ${med.duration}`, {
        x: 450,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });
    }

    yPosition -= 20;
  });

  // Instrucciones adicionales
  if (prescription.instructions && prescription.instructions.trim()) {
    yPosition -= 30;
    page.drawRectangle({
      x: 50,
      y: yPosition - 5,
      width: 495,
      height: 25,
      color: rgb(0.95, 0.95, 0.95)
    });
    
    page.drawText('INSTRUCCIONES ADICIONALES', {
      x: 55,
      y: yPosition + 5,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    yPosition -= 35;
    
    // Dividir instrucciones largas en líneas
    const instructions = prescription.instructions;
    const maxLineWidth = 80;
    const words = instructions.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLineWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          page.drawText(currentLine, {
            x: 60,
            y: yPosition,
            size: 10,
            font: font
          });
          yPosition -= 15;
        }
        currentLine = word;
      }
    }
    
    if (currentLine) {
      page.drawText(currentLine, {
        x: 60,
        y: yPosition,
        size: 10,
        font: font
      });
    }
  }

  // Footer profesional
  const footerY = 100;
  page.drawLine({
    start: { x: 50, y: footerY + 40 },
    end: { x: 545, y: footerY + 40 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });

  page.drawText(`Fecha de prescripción: ${prescription.createdAt.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })}`, {
    x: 50,
    y: footerY + 15,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  page.drawText('Válida por 30 días desde su emisión', {
    x: 50,
    y: footerY,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  if (isHistorical) {
    page.drawText(`Documento regenerado: ${new Date().toLocaleDateString('es-ES')}`, {
      x: 320,
      y: footerY + 15,
      size: 9,
      font: font,
      color: rgb(0.8, 0.4, 0.1)
    });
  }

  page.drawText(`ID de receta: RX${prescription.id}`, {
    x: 450,
    y: footerY,
    size: 9,
    font: boldFont,
    color: rgb(0.5, 0.5, 0.5)
  });

  return await pdfDoc.save();
}

// ==================== RUTAS API ====================

// CREAR RECETA (Solo metadatos - Optimizado para Neon)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { petId, title, medications, instructions } = req.body;
    const userId = req.userId;

    // Validaciones completas
    if (!petId || !title?.trim() || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    for (const med of medications) {
      if (!med.name?.trim() || !med.dose?.trim() || !med.frequency?.trim()) {
        return res.status(400).json({ error: 'Información de medicamentos incompleta' });
      }
    }

    // Verificar que la mascota pertenece al usuario
    const pet = await prisma.pet.findFirst({
      where: { 
        id: parseInt(petId),
        tutorId: userId 
      },
      include: {
        tutor: {
          select: { name: true, phone: true, email: true }
        }
      }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    // Crear receta (SOLO METADATOS - 98% menos almacenamiento)
    const prescription = await prisma.prescription.create({
      data: {
        petId: parseInt(petId),
        title: title.trim(),
        medications: JSON.stringify(medications), // ~1-2KB vs 50-200KB de PDF
        instructions: instructions?.trim() || '',
        createdAt: new Date()
      }
    });

    res.status(201).json({
      id: prescription.id,
      message: 'Receta creada con acceso perpetuo garantizado',
      prescription: {
        id: prescription.id,
        title: prescription.title,
        medications: JSON.parse(prescription.medications),
        instructions: prescription.instructions,
        createdAt: prescription.createdAt,
        storageOptimization: '98% menos uso de base de datos'
      }
    });

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// VER/DESCARGAR PDF (Acceso perpetuo garantizado)
router.get('/:id/pdf', verifyToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const userId = req.userId;
    const startTime = Date.now();

    if (isNaN(prescriptionId)) {
      return res.status(400).json({ error: 'ID de receta inválido' });
    }

    // Verificar acceso (sin límite temporal - acceso perpetuo)
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        pet: { tutorId: userId }
      },
      include: {
        pet: {
          include: {
            tutor: { select: { name: true, phone: true, email: true } }
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Receta no encontrada o sin acceso' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true, clinicName: true }
    });

    await ensureDirectories();

    // Actualizar estadísticas de uso
    const currentStats = pdfStats.get(prescriptionId) || { 
      accessCount: 0, 
      lastAccess: 0, 
      firstAccess: Date.now() 
    };
    
    currentStats.accessCount++;
    currentStats.lastAccess = Date.now();
    pdfStats.set(prescriptionId, currentStats);

    // Buscar PDF existente
    const existingPDF = await findExistingPDF(prescriptionId);
    
    if (existingPDF) {
      const responseTime = Date.now() - startTime;
      console.log(`📄 Sirviendo PDF desde ${existingPDF.level} para receta ${prescriptionId} (${responseTime}ms)`);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="receta_${prescription.pet.name}_${prescriptionId}.pdf"`);
      res.setHeader('X-PDF-Source', existingPDF.level);
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      return res.sendFile(existingPDF.path);
    }

    // No existe, regenerar desde metadatos (ACCESO PERPETUO)
    const prescriptionAge = Date.now() - prescription.createdAt.getTime();
    const isHistorical = prescriptionAge > (180 * 24 * 60 * 60 * 1000); // +6 meses
    
    console.log(`🔄 Regenerando PDF ${isHistorical ? 'histórico' : 'reciente'} para receta ${prescriptionId}`);
    
    const pdfBytes = await generateEnhancedPDF(prescription, user, isHistorical);

    // Decidir dónde guardar según edad y uso
    const saveDir = isHistorical ? ARCHIVE_PDF_DIR : CACHE_PDF_DIR;
    const savePath = path.join(saveDir, `${prescriptionId}.pdf`);
    
    await fs.writeFile(savePath, pdfBytes);

    const responseTime = Date.now() - startTime;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receta_${prescription.pet.name}_${prescriptionId}.pdf"`);
    res.setHeader('X-PDF-Source', isHistorical ? 'regenerated-historical' : 'regenerated-recent');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

// LISTAR RECETAS (Solo metadatos)
router.get('/pet/:petId', verifyToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.userId;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        petId: parseInt(petId),
        pet: {
          tutorId: userId
        }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        medications: true, // JSON string
        instructions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parsear medicamentos y añadir estadísticas
    const formatted = prescriptions.map(p => {
      const stats = pdfStats.get(p.id);
      const ageMonths = (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      return {
        ...p,
        medications: JSON.parse(p.medications),
        stats: {
          accessCount: stats?.accessCount || 0,
          lastAccess: stats?.lastAccess ? new Date(stats.lastAccess).toISOString() : null,
          ageMonths: Math.round(ageMonths * 10) / 10
        }
      };
    });

    res.json({
      prescriptions: formatted,
      systemInfo: {
        guaranteedAccess: 'Acceso perpetuo a todas las recetas históricas',
        storageOptimization: '98% menos uso de base de datos'
      }
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GENERAR ENLACE TEMPORAL PARA COMPARTIR
router.post('/:id/download-link', verifyToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const userId = req.userId;

    if (isNaN(prescriptionId)) {
      return res.status(400).json({ error: 'ID de receta inválido' });
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        pet: { tutorId: userId }
      }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (48 * 60 * 60 * 1000);
    
    global.downloadTokens.set(downloadToken, {
      prescriptionId,
      userId,
      expiresAt
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/prescriptions/download/${downloadToken}`;

    res.json({
      downloadUrl,
      expiresAt: new Date(expiresAt),
      expiresIn: '48 horas'
    });

  } catch (error) {
    console.error('Error creating download link:', error);
    res.status(500).json({ error: 'Error generando enlace' });
  }
});

// DESCARGAR VIA ENLACE TEMPORAL
router.get('/download/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const tokenData = global.downloadTokens.get(token);
    
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return res.status(410).json({ error: 'Enlace expirado o inválido' });
    }

    global.downloadTokens.delete(token);

    const prescription = await prisma.prescription.findFirst({
      where: {
        id: tokenData.prescriptionId,
        pet: { tutorId: tokenData.userId }
      },
      include: {
        pet: {
          include: {
            tutor: { select: { name: true, phone: true, email: true } }
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { fullName: true, email: true, clinicName: true }
    });

    const pdfBytes = await generateEnhancedPDF(prescription, user, false);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receta_${prescription.pet.name}_${prescription.id}.pdf"`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error downloading via token:', error);
    res.status(500).json({ error: 'Error descargando archivo' });
  }
});

// Inicializar directorios
ensureDirectories();

module.exports = router;