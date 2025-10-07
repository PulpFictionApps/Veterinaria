// Estrategia híbrida: Metadatos en DB + Generación bajo demanda + Caché temporal
const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configuración
const TEMP_PDF_DIR = path.join(__dirname, '../../../tmp/pdfs');
const CACHE_PDF_DIR = path.join(__dirname, '../../../tmp/cache');
const PDF_CACHE_DAYS = 30; // PDFs en caché por 30 días
const DOWNLOAD_EXPIRY_HOURS = 48; // Enlaces válidos por 48 horas

// Sistema de caché en memoria para PDFs frecuentemente accedidos
const pdfCache = new Map(); // prescriptionId -> { filePath, lastAccess, accessCount }

// Asegurar directorios
async function ensureDirectories() {
  await fs.mkdir(TEMP_PDF_DIR, { recursive: true });
  await fs.mkdir(CACHE_PDF_DIR, { recursive: true });
}

// Limpiar caché basado en uso y tiempo
async function smartCleanup() {
  try {
    const now = Date.now();
    
    // 1. Limpiar enlaces de descarga expirados
    for (const [token, data] of global.downloadTokens || new Map()) {
      if (data.expiresAt < now) {
        global.downloadTokens.delete(token);
      }
    }

    // 2. Limpiar archivos temporales (descargas inmediatas)
    const tempFiles = await fs.readdir(TEMP_PDF_DIR);
    for (const file of tempFiles) {
      const filePath = path.join(TEMP_PDF_DIR, file);
      const stats = await fs.stat(filePath);
      const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > 2) { // Archivos temporales solo 2 horas
        await fs.unlink(filePath);
      }
    }

    // 3. Limpiar caché inteligentemente
    const cacheFiles = await fs.readdir(CACHE_PDF_DIR);
    for (const file of cacheFiles) {
      const prescriptionId = file.replace('.pdf', '');
      const filePath = path.join(CACHE_PDF_DIR, file);
      const stats = await fs.stat(filePath);
      const ageDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      const cacheData = pdfCache.get(parseInt(prescriptionId));
      
      // Eliminar si:
      // - Más de 30 días Y menos de 3 accesos
      // - Más de 90 días independientemente de accesos
      if ((ageDays > PDF_CACHE_DAYS && (!cacheData || cacheData.accessCount < 3)) || 
          ageDays > 90) {
        await fs.unlink(filePath);
        pdfCache.delete(parseInt(prescriptionId));
        console.log(`Cleaned cached PDF: ${file}`);
      }
    }

  } catch (error) {
    console.error('Error in smart cleanup:', error);
  }
}

// Ejecutar limpieza cada 6 horas
setInterval(smartCleanup, 6 * 60 * 60 * 1000);

// Generar PDF (función reutilizable)
async function generatePDF(prescription, user) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 800;
  
  // Header con diseño profesional
  page.drawRectangle({
    x: 40,
    y: yPosition - 10,
    width: 515,
    height: 60,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawText('RECETA VETERINARIA', {
    x: 50,
    y: yPosition + 20,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8)
  });
  
  page.drawText(`N° ${prescription.id.toString().padStart(6, '0')}`, {
    x: 450,
    y: yPosition + 20,
    size: 12,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4)
  });

  yPosition -= 80;

  // Información de la clínica
  page.drawText(`${user.clinicName || 'Clínica Veterinaria'}`, {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont
  });

  yPosition -= 20;
  page.drawText(`Médico Veterinario: ${user.fullName || 'Dr. Veterinario'}`, {
    x: 50,
    y: yPosition,
    size: 11,
    font: font
  });

  if (user.email) {
    yPosition -= 15;
    page.drawText(`Email: ${user.email}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    });
  }

  // Línea separadora
  yPosition -= 25;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });

  // Información del paciente
  yPosition -= 30;
  page.drawText('DATOS DEL PACIENTE', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3)
  });

  yPosition -= 25;
  page.drawText(`Paciente: ${prescription.pet.name}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: boldFont
  });

  if (prescription.pet.type) {
    page.drawText(`Especie: ${prescription.pet.type}`, {
      x: 300,
      y: yPosition,
      size: 11,
      font: font
    });
  }

  yPosition -= 18;
  page.drawText(`Propietario: ${prescription.pet.tutor.name}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: font
  });

  if (prescription.pet.tutor.phone) {
    page.drawText(`Tel: ${prescription.pet.tutor.phone}`, {
      x: 300,
      y: yPosition,
      size: 11,
      font: font
    });
  }

  // Línea separadora
  yPosition -= 25;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });

  // Título de la receta
  yPosition -= 30;
  page.drawText(prescription.title.toUpperCase(), {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8)
  });

  // Medicamentos
  yPosition -= 35;
  page.drawText('PRESCRIPCIÓN MÉDICA', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3)
  });

  const medications = JSON.parse(prescription.medications);
  medications.forEach((med, index) => {
    yPosition -= 30;
    
    // Número de medicamento
    page.drawText(`${index + 1}.`, {
      x: 60,
      y: yPosition,
      size: 11,
      font: boldFont
    });

    // Nombre del medicamento (destacado)
    page.drawText(med.name.toUpperCase(), {
      x: 80,
      y: yPosition,
      size: 11,
      font: boldFont
    });
    
    yPosition -= 16;
    page.drawText(`Dosis: ${med.dose}`, {
      x: 80,
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
      yPosition -= 12;
      page.drawText(`Duración: ${med.duration}`, {
        x: 80,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });
    }
  });

  // Instrucciones adicionales
  if (prescription.instructions) {
    yPosition -= 40;
    page.drawText('INSTRUCCIONES ESPECIALES', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    yPosition -= 25;
    
    // Dividir instrucciones en líneas si es muy largo
    const maxWidth = 480;
    const words = prescription.instructions.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, 10);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
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

  // Footer
  const footerY = 80;
  page.drawLine({
    start: { x: 50, y: footerY + 20 },
    end: { x: 545, y: footerY + 20 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8)
  });

  page.drawText(`Fecha: ${prescription.createdAt.toLocaleDateString('es-ES')}`, {
    x: 50,
    y: footerY,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  page.drawText('Receta válida por 30 días', {
    x: 250,
    y: footerY,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  page.drawText(`ID: RX${prescription.id}`, {
    x: 450,
    y: footerY,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  return await pdfDoc.save();
}

// CREAR RECETA (Solo metadatos en DB)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { petId, title, medications, instructions } = req.body;
    const userId = req.userId;

    // Validaciones
    if (!petId || !title || !medications?.length) {
      return res.status(400).json({ error: 'Datos incompletos' });
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

    // Crear receta (SOLO METADATOS)
    const prescription = await prisma.prescription.create({
      data: {
        petId: parseInt(petId),
        title: title.trim(),
        medications: JSON.stringify(medications),
        instructions: instructions?.trim() || '',
        createdAt: new Date()
      }
    });

    res.status(201).json({
      id: prescription.id,
      message: 'Receta creada exitosamente',
      prescription: {
        id: prescription.id,
        title: prescription.title,
        medications: JSON.parse(prescription.medications),
        instructions: prescription.instructions,
        createdAt: prescription.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// VER/DESCARGAR PDF (Con caché inteligente)
router.get('/:id/pdf', verifyToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const userId = req.userId;

    // Verificar acceso
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        pet: {
          tutorId: userId
        }
      },
      include: {
        pet: {
          include: {
            tutor: {
              select: { name: true, phone: true, email: true }
            }
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true, clinicName: true }
    });

    await ensureDirectories();

    // 1. Verificar si existe en caché
    const cacheFileName = `${prescriptionId}.pdf`;
    const cacheFilePath = path.join(CACHE_PDF_DIR, cacheFileName);

    try {
      await fs.access(cacheFilePath);
      
      // Actualizar estadísticas de acceso
      const cacheData = pdfCache.get(prescriptionId) || { accessCount: 0 };
      cacheData.lastAccess = Date.now();
      cacheData.accessCount = (cacheData.accessCount || 0) + 1;
      cacheData.filePath = cacheFilePath;
      pdfCache.set(prescriptionId, cacheData);

      // Enviar desde caché
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="receta_${prescription.pet.name}_${prescriptionId}.pdf"`);
      res.setHeader('X-PDF-Source', 'cache');
      
      return res.sendFile(cacheFilePath);

    } catch {
      // No está en caché, generar nuevo
    }

    // 2. Generar PDF
    const pdfBytes = await generatePDF(prescription, user);

    // 3. Guardar en caché para futuro acceso
    await fs.writeFile(cacheFilePath, pdfBytes);
    
    // Actualizar caché en memoria
    pdfCache.set(prescriptionId, {
      filePath: cacheFilePath,
      lastAccess: Date.now(),
      accessCount: 1
    });

    // 4. Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receta_${prescription.pet.name}_${prescriptionId}.pdf"`);
    res.setHeader('X-PDF-Source', 'generated');
    
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

// GENERAR ENLACE DE DESCARGA (Para WhatsApp, email, etc.)
router.post('/:id/download-link', verifyToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const userId = req.userId;

    // Verificar acceso
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        pet: { tutorId: userId }
      }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    // Generar token temporal
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (DOWNLOAD_EXPIRY_HOURS * 60 * 60 * 1000);
    
    global.downloadTokens = global.downloadTokens || new Map();
    global.downloadTokens.set(downloadToken, {
      prescriptionId,
      userId,
      expiresAt
    });

    res.json({
      downloadUrl: `/api/prescriptions/download/${downloadToken}`,
      expiresAt: new Date(expiresAt),
      expiresIn: `${DOWNLOAD_EXPIRY_HOURS} horas`
    });

  } catch (error) {
    console.error('Error creating download link:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DESCARGAR POR ENLACE TEMPORAL
router.get('/download/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    global.downloadTokens = global.downloadTokens || new Map();
    const tokenData = global.downloadTokens.get(token);
    
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return res.status(410).json({ error: 'Enlace de descarga expirado' });
    }

    // Reutilizar la lógica de generación
    req.userId = tokenData.userId;
    req.params.id = tokenData.prescriptionId.toString();
    
    // Modificar headers para descarga
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name, value) {
      if (name === 'Content-Disposition') {
        value = value.replace('inline', 'attachment');
      }
      return originalSetHeader.call(this, name, value);
    };

    // Eliminar token usado
    global.downloadTokens.delete(token);

    // Redirigir a la función de PDF
    return router.handle({
      ...req,
      url: `/${tokenData.prescriptionId}/pdf`,
      params: { id: tokenData.prescriptionId.toString() }
    }, res);

  } catch (error) {
    console.error('Error downloading via token:', error);
    res.status(500).json({ error: 'Error descargando archivo' });
  }
});

// LISTAR RECETAS
router.get('/pet/:petId', verifyToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.userId;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        petId: parseInt(petId),
        pet: { tutorId: userId }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        medications: true,
        instructions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = prescriptions.map(p => ({
      ...p,
      medications: JSON.parse(p.medications),
      // Agregar info de caché para el frontend
      inCache: pdfCache.has(p.id),
      accessCount: pdfCache.get(p.id)?.accessCount || 0
    }));

    res.json(formatted);

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ESTADÍSTICAS DE CACHÉ (Para administración)
router.get('/cache/stats', verifyToken, async (req, res) => {
  try {
    const stats = {
      cacheSize: pdfCache.size,
      totalAccessCount: Array.from(pdfCache.values()).reduce((sum, item) => sum + item.accessCount, 0),
      mostAccessed: Array.from(pdfCache.entries())
        .sort(([,a], [,b]) => b.accessCount - a.accessCount)
        .slice(0, 10)
        .map(([id, data]) => ({ prescriptionId: id, accessCount: data.accessCount }))
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;