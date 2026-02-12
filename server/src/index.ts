import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db/schema.js';
import { authenticateToken } from './middleware/auth.js';
import type { AuthRequest } from './middleware/auth.js';
import { createAuthRouter } from './routes/auth.js';
import { createSurveyRouter } from './routes/surveys.js';
import { createCaptureRouter } from './routes/captures.js';
import { createPhotoRouter } from './routes/photos.js';
import { generatePdf } from './services/pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'rics-survey.db');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

// Ensure required directories exist
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize the SQLite database
const db = initDb(DB_PATH);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded photos (both paths for compatibility)
app.use('/api/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// =========================================================================
// Routes under /api prefix
// =========================================================================

// Health check endpoint (no authentication required)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no authentication required)
app.use('/api/auth', createAuthRouter(db));

// Survey routes (authentication required)
app.use('/api/surveys', authenticateToken, createSurveyRouter(db));

// Capture routes (authentication required)
const captureRouter = createCaptureRouter(db);
app.use('/api', authenticateToken, captureRouter);

// Photo routes (authentication required)
const photoRouter = createPhotoRouter(db, UPLOADS_DIR);
app.use('/api', authenticateToken, photoRouter);

// PDF generation endpoint
app.get('/api/surveys/:id/pdf', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify survey ownership
    const survey = db
      .prepare('SELECT * FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.id, req.userId) as { id: string; reference: string | null; propertyAddress: string | null } | undefined;

    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const pdfBuffer = await generatePdf(req.params.id, db, UPLOADS_DIR);

    const filename = `RICS_Survey_${survey.reference || survey.id.substring(0, 8)}.pdf`
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// Serve frontend in production
const CLIENT_DIR = process.env.CLIENT_DIR || path.join(__dirname, '..', '..', 'dist');
if (fs.existsSync(CLIENT_DIR)) {
  app.use(express.static(CLIENT_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`RICS Survey Server running on port ${PORT}`);
  console.log(`Database: ${DB_PATH}`);
  console.log(`Uploads: ${UPLOADS_DIR}`);
});

export default app;
