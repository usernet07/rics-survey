import { Router } from 'express';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type Database from 'better-sqlite3';
import type { AuthRequest } from '../middleware/auth.js';

interface CaptureRow {
  id: string;
  surveyId: string;
  sectionId: string;
  conditionRating: string | null;
  construction: string | null;
  observations: string | null;
  meaning: string | null;
  recommendations: string | null;
  standardText: string | null;
  audioNotes: string | null;
  fieldData: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PhotoRow {
  id: string;
  captureId: string;
  surveyId: string;
  sectionId: string;
  filename: string;
  originalName: string;
  description: string | null;
  createdAt: string;
}

function enrichCapture(capture: CaptureRow, photos: PhotoRow[]) {
  return {
    ...capture,
    photos: photos.map((p) => ({
      ...p,
      url: `/uploads/${p.filename}`,
      thumbnailUrl: `/uploads/thumb_${p.filename}`,
    })),
  };
}

export function createCaptureRouter(db: Database.Database): Router {
  const router = Router({ mergeParams: true });

  // GET /surveys/:surveyId/captures - get all captures for a survey
  router.get('/surveys/:surveyId/captures', (req: AuthRequest, res: Response): void => {
    // Verify survey ownership
    const survey = db
      .prepare('SELECT id FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.surveyId, req.userId);

    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const captures = db
      .prepare('SELECT * FROM captures WHERE surveyId = ? ORDER BY sectionId')
      .all(req.params.surveyId) as CaptureRow[];

    const photos = db
      .prepare('SELECT * FROM photos WHERE surveyId = ?')
      .all(req.params.surveyId) as PhotoRow[];

    const result = captures.map((capture) => {
      const capturePhotos = photos.filter((p) => p.sectionId === capture.sectionId);
      return enrichCapture(capture, capturePhotos);
    });

    res.json(result);
  });

  // GET /surveys/:surveyId/captures/:sectionId - get a single capture
  router.get('/surveys/:surveyId/captures/:sectionId', (req: AuthRequest, res: Response): void => {
    const survey = db
      .prepare('SELECT id FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.surveyId, req.userId);

    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const capture = db
      .prepare('SELECT * FROM captures WHERE surveyId = ? AND sectionId = ?')
      .get(req.params.surveyId, req.params.sectionId) as CaptureRow | undefined;

    if (!capture) {
      res.status(404).json({ message: 'Capture not found' });
      return;
    }

    const photos = db
      .prepare('SELECT * FROM photos WHERE surveyId = ? AND sectionId = ?')
      .all(req.params.surveyId, req.params.sectionId) as PhotoRow[];

    res.json(enrichCapture(capture, photos));
  });

  // PUT /surveys/:surveyId/captures/:sectionId - upsert a capture
  router.put('/surveys/:surveyId/captures/:sectionId', (req: AuthRequest, res: Response): void => {
    const survey = db
      .prepare('SELECT id FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.surveyId, req.userId);

    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const { surveyId, sectionId } = req.params;
    const now = new Date().toISOString();

    // Known DB column keys
    const DB_KEYS = new Set([
      'id', 'surveyId', 'sectionId', 'conditionRating', 'construction',
      'observations', 'meaning', 'recommendations', 'standardText',
      'audioNotes', 'fieldData', 'photos', 'createdAt', 'updatedAt',
    ]);

    const {
      conditionRating,
      construction,
      observations,
      meaning,
      recommendations,
      standardText,
      audioNotes,
    } = req.body;

    // Collect any unknown fields into fieldData (safety net for custom section fields)
    let fieldData = req.body.fieldData;
    if (!fieldData) {
      const extraFields: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (!DB_KEYS.has(key) && value && typeof value === 'string' && value.trim()) {
          extraFields[key] = value;
        }
      }
      if (Object.keys(extraFields).length > 0) {
        fieldData = JSON.stringify(extraFields);
      }
    }

    // Check if capture already exists
    const existing = db
      .prepare('SELECT id FROM captures WHERE surveyId = ? AND sectionId = ?')
      .get(surveyId, sectionId) as { id: string } | undefined;

    const id = existing?.id || uuidv4();

    db.prepare(
      `INSERT OR REPLACE INTO captures (
        id, surveyId, sectionId, conditionRating, construction, observations,
        meaning, recommendations, standardText, audioNotes, fieldData,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT createdAt FROM captures WHERE id = ?), ?), ?)`
    ).run(
      id,
      surveyId,
      sectionId,
      conditionRating != null ? String(conditionRating) : null,
      construction || null,
      observations || null,
      meaning || null,
      recommendations || null,
      standardText || null,
      audioNotes || null,
      fieldData ? (typeof fieldData === 'string' ? fieldData : JSON.stringify(fieldData)) : null,
      id,
      now,
      now
    );

    // Update survey's updatedAt timestamp
    db.prepare('UPDATE surveys SET updatedAt = ? WHERE id = ?').run(now, surveyId);

    const capture = db
      .prepare('SELECT * FROM captures WHERE id = ?')
      .get(id) as CaptureRow;

    const photos = db
      .prepare('SELECT * FROM photos WHERE surveyId = ? AND sectionId = ?')
      .all(surveyId, sectionId) as PhotoRow[];

    res.json(enrichCapture(capture, photos));
  });

  return router;
}
