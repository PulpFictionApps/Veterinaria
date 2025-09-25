import fs from 'fs';
import path from 'path';

export const healthCheck = (req, res) => {
  try {
    const info = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        platform: process.platform,
        nodeVersion: process.version
      },
      filesystem: {
        tmpExists: fs.existsSync('/tmp'),
        tmpWritable: false,
        localTmpExists: false,
        localTmpWritable: false
      }
    };
    
    // Test /tmp directory access (Vercel)
    try {
      const testFile = path.join('/tmp', 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      info.filesystem.tmpWritable = true;
    } catch (e) {
      // /tmp not writable
    }
    
    // Test local tmp directory access
    try {
      const localTmp = path.join(process.cwd(), 'tmp');
      info.filesystem.localTmpExists = fs.existsSync(localTmp);
      
      if (!info.filesystem.localTmpExists) {
        fs.mkdirSync(localTmp, { recursive: true });
        info.filesystem.localTmpExists = true;
      }
      
      const testFile = path.join(localTmp, 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      info.filesystem.localTmpWritable = true;
    } catch (e) {
      // Local tmp not accessible
    }
    
    res.json(info);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};