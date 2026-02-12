import { Router } from 'express';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type Database from 'better-sqlite3';
import type { AuthRequest } from '../middleware/auth.js';

export function createSurveyRouter(db: Database.Database): Router {
  const router = Router();

  // GET / - list all surveys for authenticated user
  router.get('/', (req: AuthRequest, res: Response): void => {
    const surveys = db
      .prepare('SELECT * FROM surveys WHERE userId = ? ORDER BY updatedAt DESC')
      .all(req.userId);

    res.json(surveys);
  });

  // POST / - create new survey
  router.post('/', (req: AuthRequest, res: Response): void => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const {
      reference,
      surveyDate,
      reportDate,
      clientName,
      propertyAddress,
      propertyType,
      constructionType,
      approximateAge,
      approximateArea,
      tenure,
      weather,
      orientation,
      accommodation,
      garageOutbuildings,
      status,
    } = req.body;

    db.prepare(
      `INSERT INTO surveys (
        id, userId, reference, surveyDate, reportDate, clientName, propertyAddress,
        propertyType, constructionType, approximateAge, approximateArea, tenure,
        weather, orientation, accommodation, garageOutbuildings, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      req.userId,
      reference || null,
      surveyDate || null,
      reportDate || null,
      clientName || null,
      propertyAddress || null,
      propertyType || null,
      constructionType || null,
      approximateAge || null,
      approximateArea || null,
      tenure || null,
      weather || null,
      orientation || null,
      accommodation || null,
      garageOutbuildings || null,
      status || 'draft',
      now,
      now
    );

    const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(id);
    res.status(201).json(survey);
  });

  // GET /:id - get single survey
  router.get('/:id', (req: AuthRequest, res: Response): void => {
    const survey = db
      .prepare('SELECT * FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.id, req.userId);

    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    res.json(survey);
  });

  // PUT /:id - update survey
  router.put('/:id', (req: AuthRequest, res: Response): void => {
    const existing = db
      .prepare('SELECT * FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.id, req.userId);

    if (!existing) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const now = new Date().toISOString();
    const {
      reference,
      surveyDate,
      reportDate,
      clientName,
      propertyAddress,
      propertyType,
      constructionType,
      approximateAge,
      approximateArea,
      tenure,
      weather,
      orientation,
      accommodation,
      garageOutbuildings,
      status,
    } = req.body;

    db.prepare(
      `UPDATE surveys SET
        reference = COALESCE(?, reference),
        surveyDate = COALESCE(?, surveyDate),
        reportDate = COALESCE(?, reportDate),
        clientName = COALESCE(?, clientName),
        propertyAddress = COALESCE(?, propertyAddress),
        propertyType = COALESCE(?, propertyType),
        constructionType = COALESCE(?, constructionType),
        approximateAge = COALESCE(?, approximateAge),
        approximateArea = COALESCE(?, approximateArea),
        tenure = COALESCE(?, tenure),
        weather = COALESCE(?, weather),
        orientation = COALESCE(?, orientation),
        accommodation = COALESCE(?, accommodation),
        garageOutbuildings = COALESCE(?, garageOutbuildings),
        status = COALESCE(?, status),
        updatedAt = ?
      WHERE id = ? AND userId = ?`
    ).run(
      reference ?? null,
      surveyDate ?? null,
      reportDate ?? null,
      clientName ?? null,
      propertyAddress ?? null,
      propertyType ?? null,
      constructionType ?? null,
      approximateAge ?? null,
      approximateArea ?? null,
      tenure ?? null,
      weather ?? null,
      orientation ?? null,
      accommodation ?? null,
      garageOutbuildings ?? null,
      status ?? null,
      now,
      req.params.id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM surveys WHERE id = ?').get(req.params.id);
    res.json(updated);
  });

  // DELETE /:id - delete survey and cascading captures/photos
  router.delete('/:id', (req: AuthRequest, res: Response): void => {
    const existing = db
      .prepare('SELECT * FROM surveys WHERE id = ? AND userId = ?')
      .get(req.params.id, req.userId);

    if (!existing) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }

    const deleteTransaction = db.transaction(() => {
      db.prepare('DELETE FROM photos WHERE surveyId = ?').run(req.params.id);
      db.prepare('DELETE FROM captures WHERE surveyId = ?').run(req.params.id);
      db.prepare('DELETE FROM repair_costs WHERE surveyId = ?').run(req.params.id);
      db.prepare('DELETE FROM surveys WHERE id = ?').run(req.params.id);
    });

    deleteTransaction();

    res.json({ message: 'Survey deleted successfully' });
  });

  return router;
}
