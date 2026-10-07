import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Route: Download everything in a single comprehensive ZIP file
  app.get('/api/download-all-zip', async (_req, res) => {
    try {
      const zip = new JSZip();

      // Helper to recursively add files, ignoring node_modules, .git, dist
      function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (
            entry.name === 'node_modules' ||
            entry.name === '.git' ||
            entry.name === 'dist' ||
            entry.name === '.bun' ||
            entry.name.endsWith('.log')
          ) {
            continue;
          }

          if (entry.isDirectory()) {
            const nextZipFolder = zipFolder.folder(entry.name);
            if (nextZipFolder) {
              addDirectoryToZip(fullPath, nextZipFolder);
            }
          } else if (entry.isFile()) {
            const content = fs.readFileSync(fullPath);
            zipFolder.file(entry.name, content);
          }
        }
      }

      addDirectoryToZip(__dirname, zip);

      // Generate buffer
      const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="SkillTest_Complete_Application.zip"'
      );
      res.setHeader('Content-Length', buffer.length.toString());
      res.end(buffer);
    } catch (error) {
      console.error('Failed to generate zip:', error);
      res.status(500).json({ error: 'Failed to generate ZIP archive' });
    }
  });

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
