import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

// Endpoint temporal para diagnosticar problemas de base de datos
router.get('/health', async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      DATABASE_URL: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'NO CONFIGURADA',
      VERCEL: process.env.VERCEL ? 'YES' : 'NO'
    },
    database: {
      status: 'unknown',
      error: null,
      connectionTest: null,
      userCount: null
    }
  };

  try {
    // Test básico de conexión
    console.log('[HEALTH] Testing basic database connection...');
    await prisma.$queryRaw`SELECT 1 as test`;
    diagnostics.database.connectionTest = 'SUCCESS';
    
    // Test de conteo de usuarios
    console.log('[HEALTH] Testing user count...');
    const count = await prisma.user.count();
    diagnostics.database.userCount = count;
    diagnostics.database.status = 'CONNECTED';
    
    console.log('[HEALTH] Database diagnostics completed successfully');
    res.json({
      status: 'OK',
      diagnostics
    });
    
  } catch (error) {
    console.error('[HEALTH] Database diagnostics failed:', error.message);
    
    diagnostics.database.status = 'ERROR';
    diagnostics.database.error = {
      message: error.message,
      code: error.code,
      name: error.constructor.name
    };
    
    // Análisis del tipo de error
    let errorAnalysis = 'Unknown error';
    if (error.message.includes('Authentication failed')) {
      errorAnalysis = 'DATABASE_CREDENTIALS_INVALID';
    } else if (error.message.includes("Can't reach database server")) {
      errorAnalysis = 'DATABASE_SERVER_UNREACHABLE';
    } else if (error.message.includes('Tenant or user not found')) {
      errorAnalysis = 'DATABASE_PROJECT_NOT_FOUND';
    }
    
    diagnostics.database.errorAnalysis = errorAnalysis;
    
    res.status(500).json({
      status: 'ERROR',
      diagnostics
    });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;