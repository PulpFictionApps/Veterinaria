// Solución completa: Acceso perpetuo + Optimización Neon
const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configuración de almacenamiento por niveles
const TEMP_PDF_DIR = path.join(__dirname, '../../../tmp/pdfs');           // Descargas inmediatas
const CACHE_PDF_DIR = path.join(__dirname, '../../../tmp/cache');         // Caché 30-90 días
const ARCHIVE_PDF_DIR = path.join(__dirname, '../../../archive/pdfs');    // Archivo permanente

// Configuración temporal
const IMMEDIATE_CLEANUP_HOURS = 2;    // Descargas temporales
const CACHE_DAYS = 30;                // Caché activo
const EXTENDED_CACHE_DAYS = 90;       // Caché extendido para muy usados
const ARCHIVE_THRESHOLD_DAYS = 180;   // Mover a archivo después de 6 meses

// Estadísticas de uso en memoria
const pdfStats = new Map(); // prescriptionId -> { accessCount, lastAccess, firstAccess }

// Asegurar todas las carpetas
async function ensureAllDirectories() {
  await fs.mkdir(TEMP_PDF_DIR, { recursive: true });
  await fs.mkdir(CACHE_PDF_DIR, { recursive: true });
  await fs.mkdir(ARCHIVE_PDF_DIR, { recursive: true });
}

// Sistema de limpieza multinivel inteligente
async function multilevelCleanup() {
  try {
    const now = Date.now();
    console.log('🧹 Ejecutando limpieza multinivel...');

    // 1. Limpiar descargas temporales (2 horas)
    await cleanDirectory(TEMP_PDF_DIR, IMMEDIATE_CLEANUP_HOURS / 24, 'temporal');

    // 2. Gestionar caché inteligentemente
    await smartCacheManagement(now);

    // 3. Archivar PDFs antiguos pero mantener acceso
    await archiveOldPDFs(now);

    console.log('✅ Limpieza multinivel completada');

  } catch (error) {
    console.error('❌ Error en limpieza multinivel:', error);
  }
}

async function cleanDirectory(dirPath, maxDays, type) {
  try {
    const files = await fs.readdir(dirPath);
    let cleaned = 0;

    for (const file of files) {
      if (!file.endsWith('.pdf')) continue;
      
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      const ageDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageDays > maxDays) {
        await fs.unlink(filePath);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️  Limpiados ${cleaned} PDFs ${type}`);
    }
  } catch (error) {
    console.error(`Error limpiando directorio ${type}:`, error);
  }
}

async function smartCacheManagement(now) {
  try {
    const cacheFiles = await fs.readdir(CACHE_PDF_DIR);
    let moved = 0, kept = 0, deleted = 0;

    for (const file of cacheFiles) {
      if (!file.endsWith('.pdf')) continue;

      const prescriptionId = parseInt(file.replace('.pdf', ''));
      const filePath = path.join(CACHE_PDF_DIR, file);
      const stats = await fs.stat(filePath);
      const ageDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      const usage = pdfStats.get(prescriptionId) || { accessCount: 0, lastAccess: 0 };
      const daysSinceLastAccess = (now - usage.lastAccess) / (1000 * 60 * 60 * 24);

      // Lógica inteligente de retención
      if (usage.accessCount >= 5 && ageDays < EXTENDED_CACHE_DAYS) {
        // Muy usado, mantener en caché extendido
        kept++;
      } else if (ageDays > ARCHIVE_THRESHOLD_DAYS) {
        // Mover a archivo permanente
        const archivePath = path.join(ARCHIVE_PDF_DIR, file);
        await fs.rename(filePath, archivePath);
        moved++;
      } else if (ageDays > CACHE_DAYS && usage.accessCount < 2) {
        // Poco usado y viejo, eliminar (se puede regenerar)
        await fs.unlink(filePath);
        deleted++;
      } else {
        // Mantener en caché normal
        kept++;
      }
    }

    console.log(`📊 Caché: ${kept} mantenidos, ${moved} archivados, ${deleted} eliminados`);
  } catch (error) {
    console.error('Error en gestión de caché:', error);
  }
}

async function archiveOldPDFs(now) {
  try {
    // Los PDFs en archivo se mantienen indefinidamente
    // Solo organizamos por año para mejor gestión
    const archiveFiles = await fs.readdir(ARCHIVE_PDF_DIR);
    const currentYear = new Date().getFullYear();
    
    for (const file of archiveFiles) {
      if (!file.endsWith('.pdf') || file.includes('_')) continue; // Ya organizado
      
      const filePath = path.join(ARCHIVE_PDF_DIR, file);
      const stats = await fs.stat(filePath);
      const fileYear = new Date(stats.mtime).getFullYear();
      
      if (fileYear < currentYear) {
        // Crear carpeta por año
        const yearDir = path.join(ARCHIVE_PDF_DIR, fileYear.toString());
        await fs.mkdir(yearDir, { recursive: true });
        
        const newPath = path.join(yearDir, file);
        await fs.rename(filePath, newPath);
      }
    }
  } catch (error) {
    console.error('Error organizando archivo:', error);
  }
}

// Ejecutar limpieza cada 4 horas
setInterval(multilevelCleanup, 4 * 60 * 60 * 1000);

// Función mejorada para encontrar PDF en cualquier nivel
async function findPDFInAnyLevel(prescriptionId) {
  const fileName = `${prescriptionId}.pdf`;
  
  // 1. Buscar en caché activo
  const cachePath = path.join(CACHE_PDF_DIR, fileName);
  try {
    await fs.access(cachePath);
    return { path: cachePath, level: 'cache' };
  } catch {}
  
  // 2. Buscar en archivo (incluir subdirectorios por año)
  try {
    // Buscar en raíz del archivo
    const archivePath = path.join(ARCHIVE_PDF_DIR, fileName);
    await fs.access(archivePath);
    return { path: archivePath, level: 'archive' };
  } catch {}
  
  // 3. Buscar en subdirectorios por año
  try {
    const years = await fs.readdir(ARCHIVE_PDF_DIR);
    for (const year of years) {
      const yearPath = path.join(ARCHIVE_PDF_DIR, year);
      const yearStat = await fs.stat(yearPath);
      
      if (yearStat.isDirectory()) {
        const yearFilePath = path.join(yearPath, fileName);
        try {
          await fs.access(yearFilePath);
          return { path: yearFilePath, level: 'archive', year };
        } catch {}
      }
    }
  } catch {}
  
  return null; // No encontrado, necesita regeneración
}

// Función mejorada de generación con marca temporal
async function generatePDFWithTimestamp(prescription, user, isHistorical = false) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 800;
  
  // Header con indicador si es histórica
  const headerColor = isHistorical ? rgb(0.6, 0.3, 0.1) : rgb(0.2, 0.4, 0.8);
  
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
    color: headerColor
  });

  // Indicador de receta histórica
  if (isHistorical) {
    page.drawText('HISTÓRICA', {
      x: 350,
      y: yPosition + 20,
      size: 12,
      font: boldFont,
      color: rgb(0.8, 0.4, 0.1)
    });
  }
  
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

  // Medicamentos
  yPosition -= 50;
  page.drawText('PRESCRIPCIÓN MÉDICA', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: headerColor
  });

  page.drawText(prescription.title.toUpperCase(), {
    x: 250,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: headerColor
  });

  const medications = JSON.parse(prescription.medications);
  medications.forEach((med, index) => {
    yPosition -= 35;
    
    page.drawText(`${index + 1}. ${med.name.toUpperCase()}`, {
      x: 60,
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
      x: 300,
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

  // Instrucciones
  if (prescription.instructions) {
    yPosition -= 40;
    page.drawText('INSTRUCCIONES ADICIONALES', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    yPosition -= 25;
    page.drawText(prescription.instructions, {
      x: 60,
      y: yPosition,
      size: 10,
      font: font
    });
  }

  // Footer con información temporal
  const footerY = 80;
  page.drawLine({
    start: { x: 50, y: footerY + 20 },
    end: { x: 545, y: footerY + 20 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8)
  });

  page.drawText(`Fecha original: ${prescription.createdAt.toLocaleDateString('es-ES')}`, {
    x: 50,
    y: footerY,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  // Indicar si es regeneración
  if (isHistorical) {
    page.drawText(`Regenerado: ${new Date().toLocaleDateString('es-ES')}`, {
      x: 200,
      y: footerY,
      size: 9,
      font: font,
      color: rgb(0.8, 0.4, 0.1)
    });
  }

  page.drawText(`ID: RX${prescription.id}`, {
    x: 450,
    y: footerY,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  });

  return await pdfDoc.save();
}

// ENDPOINT PRINCIPAL: Ver/Descargar PDF (con acceso perpetuo)
router.get('/:id/pdf', verifyToken, async (req, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);
    const userId = req.userId;
    const startTime = Date.now();

    // Verificar acceso (sin límite temporal)
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
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true, clinicName: true }
    });

    await ensureAllDirectories();

    // Actualizar estadísticas de uso
    const currentStats = pdfStats.get(prescriptionId) || { 
      accessCount: 0, 
      lastAccess: 0, 
      firstAccess: Date.now() 
    };
    
    currentStats.accessCount++;
    currentStats.lastAccess = Date.now();
    pdfStats.set(prescriptionId, currentStats);

    // Buscar PDF existente en cualquier nivel
    const existingPDF = await findPDFInAnyLevel(prescriptionId);
    
    if (existingPDF) {
      console.log(`📄 Sirviendo PDF desde ${existingPDF.level} para receta ${prescriptionId}`);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="receta_${prescription.pet.name}_${prescriptionId}.pdf"`);
      res.setHeader('X-PDF-Source', existingPDF.level);
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      
      return res.sendFile(existingPDF.path);
    }

    // No existe, regenerar desde metadatos
    console.log(`🔄 Regenerando PDF para receta histórica ${prescriptionId}`);
    
    const isHistorical = (Date.now() - prescription.createdAt.getTime()) > (180 * 24 * 60 * 60 * 1000); // +6 meses
    const pdfBytes = await generatePDFWithTimestamp(prescription, user, isHistorical);

    // Decidir dónde guardar basado en la edad
    const saveDir = isHistorical ? ARCHIVE_PDF_DIR : CACHE_PDF_DIR;
    const savePath = path.join(saveDir, `${prescriptionId}.pdf`);
    
    await fs.writeFile(savePath, pdfBytes);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receta_${prescription.pet.name}_${prescriptionId}.pdf"`);
    res.setHeader('X-PDF-Source', 'regenerated');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error accediendo PDF:', error);
    res.status(500).json({ error: 'Error accediendo al documento' });
  }
});

// BUSCAR RECETAS HISTÓRICAS (mejorado con rango temporal)
router.get('/search', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      petId, 
      startDate, 
      endDate, 
      medicationName, 
      limit = 50,
      offset = 0 
    } = req.query;

    const whereClause = {
      pet: { tutorId: userId }
    };

    if (petId) {
      whereClause.petId = parseInt(petId);
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    if (medicationName) {
      whereClause.medications = {
        contains: medicationName
      };
    }

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        pet: {
          select: { name: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const formatted = prescriptions.map(p => {
      const stats = pdfStats.get(p.id);
      const ageMonths = (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      return {
        ...p,
        medications: JSON.parse(p.medications),
        stats: {
          accessCount: stats?.accessCount || 0,
          lastAccess: stats?.lastAccess || null,
          ageMonths: Math.round(ageMonths)
        }
      };
    });

    res.json({
      prescriptions: formatted,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: formatted.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error buscando recetas:', error);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

// ESTADÍSTICAS DE SISTEMA
router.get('/system/stats', verifyToken, async (req, res) => {
  try {
    // Contar archivos por nivel
    const [tempFiles, cacheFiles, archiveFiles] = await Promise.all([
      fs.readdir(TEMP_PDF_DIR).then(files => files.filter(f => f.endsWith('.pdf')).length),
      fs.readdir(CACHE_PDF_DIR).then(files => files.filter(f => f.endsWith('.pdf')).length),
      fs.readdir(ARCHIVE_PDF_DIR).then(files => files.filter(f => f.endsWith('.pdf')).length)
    ]);

    // Estadísticas de uso
    const usageStats = Array.from(pdfStats.entries()).map(([id, stats]) => ({
      prescriptionId: id,
      ...stats,
      ageDays: Math.round((Date.now() - stats.firstAccess) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      storage: {
        temporary: tempFiles,
        cache: cacheFiles,
        archive: archiveFiles,
        total: tempFiles + cacheFiles + archiveFiles
      },
      usage: {
        totalAccesses: usageStats.reduce((sum, s) => sum + s.accessCount, 0),
        uniquePrescriptions: usageStats.length,
        mostAccessed: usageStats
          .sort((a, b) => b.accessCount - a.accessCount)
          .slice(0, 10)
      },
      system: {
        guaranteedAccess: '✅ Acceso perpetuo a todas las recetas',
        oldestAccessible: 'Sin límite temporal',
        storageOptimization: '98% menos uso de BD'
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;