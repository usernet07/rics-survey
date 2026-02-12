import { Router } from 'express';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type Database from 'better-sqlite3';
import type { AuthRequest } from '../middleware/auth.js';
import { compressPhoto } from '../services/photo.js';

export function createPhotoRouter(db: Database.Database, uploadsDir: string): Router {
  const router = Router({ mergeParams: true });

  // Configure multer for temporary file storage
  const upload = multer({
    dest: path.join(uploadsDir, 'tmp'),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (_req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, HEIC) are allowed'));
      }
    },
  });

  // Ensure tmp directory exists
  const tmpDir = path.join(uploadsDir, 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // POST /surveys/:surveyId/captures/:sectionId/photos - upload photo
  router.post(
    '/surveys/:surveyId/captures/:sectionId/photos',
    upload.single('photo'),
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const survey = db
          .prepare('SELECT id FROM surveys WHERE id = ? AND userId = ?')
          .get(req.params.surveyId, req.userId);

        if (!survey) {
          res.status(404).json({ message: 'Survey not found' });
          return;
        }

        if (!req.file) {
          res.status(400).json({ message: 'No photo file provided' });
          return;
        }

        const { surveyId, sectionId } = req.params;
        const description = req.body.description || '';

        // Find the capture for this section (if it exists)
        const capture = db
          .prepare('SELECT id FROM captures WHERE surveyId = ? AND sectionId = ?')
          .get(surveyId, sectionId) as { id: string } | undefined;

        const photoId = uuidv4();
        const ext = '.jpg';
        const filename = `${photoId}${ext}`;
        const outputPath = path.join(uploadsDir, filename);
        const thumbnailPath = path.join(uploadsDir, `thumb_${filename}`);

        // Compress the photo and generate thumbnail
        await compressPhoto(req.file.path, outputPath, thumbnailPath);

        // Clean up temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        db.prepare(
          `INSERT INTO photos (id, captureId, surveyId, sectionId, filename, originalName, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          photoId,
          capture?.id || null,
          surveyId,
          sectionId,
          filename,
          req.file.originalname,
          description
        );

        // Update survey's updatedAt timestamp
        db.prepare('UPDATE surveys SET updatedAt = ? WHERE id = ?').run(
          new Date().toISOString(),
          surveyId
        );

        const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId) as Record<string, unknown>;

        res.status(201).json({
          ...photo,
          url: `/uploads/${filename}`,
          thumbnailUrl: `/uploads/thumb_${filename}`,
        });
      } catch (err) {
        // Clean up temp file on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        console.error('Photo upload error:', err);
        res.status(500).json({ message: 'Failed to process photo' });
      }
    }
  );

  // GET /surveys/:surveyId/photos - get all photos for a survey
  router.get('/surveys/:surveyId/photos', (req: AuthRequest, res: Response): void => {
    const survey = db
      .prepare('SELECT id FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.surveyId, req.userId);

    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const photos = db
      .prepare('SELECT * FROM photos WHERE surveyId = ? ORDER BY createdAt')
      .all(req.params.surveyId) as Array<Record<string, unknown>>;

    const result = photos.map((p) => ({
      ...p,
      url: `/uploads/${p.filename}`,
      thumbnailUrl: `/uploads/thumb_${p.filename}`,
    }));

    res.json(result);
  });

  // DELETE /photos/:id - delete photo and file from disk
  router.delete('/photos/:id', (req: AuthRequest, res: Response): void => {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id) as
      | { id: string; surveyId: string; filename: string }
      | undefined;

    if (!photo) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }

    // Verify survey ownership
    const survey = db
      .prepare('SELECT id FROM surveys WHERE id = ? AND userId = ?')
      .get(photo.surveyId, req.userId);

    if (!survey) {
      res.status(403).json({ message: 'Not authorized to delete this photo' });
      return;
    }

    // Delete files from disk
    const filePath = path.join(uploadsDir, photo.filename);
    const thumbPath = path.join(uploadsDir, `thumb_${photo.filename}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);

    res.json({ message: 'Photo deleted successfully' });
  });

  return router;
}
