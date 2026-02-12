import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type Database from 'better-sqlite3';
import { JWT_SECRET } from '../middleware/auth.js';

export function createAuthRouter(db: Database.Database): Router {
  const router = Router();

  // POST /login
  router.post('/login', (req: Request, res: Response): void => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
      | { id: string; username: string; password: string; name: string }
      | undefined;

    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name },
    });
  });

  // POST /register
  router.post('/register', (req: Request, res: Response): void => {
    const { username, password, name } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      res.status(409).json({ message: 'Username already exists' });
      return;
    }

    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.prepare('INSERT INTO users (id, username, password, name) VALUES (?, ?, ?, ?)').run(
      id,
      username,
      hashedPassword,
      name || null
    );

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id, username, name: name || null },
    });
  });

  return router;
}
