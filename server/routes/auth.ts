import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/init";
import { authenticate, AuthRequest, JWT_SECRET } from "../middleware/auth";

const router = Router();

// POST /api/auth/signup
router.post("/signup", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = db.prepare(
      `INSERT INTO users (username, password_hash) VALUES ('${username}', '${passwordHash}')`
    ).run();

    const user = { id: result.lastInsertRowid as number, username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed: users.username")) {
      return res.status(409).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/signin
router.post("/signin", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const row = db.prepare(
    `SELECT id, username, password_hash FROM users WHERE username = '${username}'`
  ).get() as any;

  if (!row) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = { id: row.id, username: row.username };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user });
});

// GET /api/auth/me
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare(
    `SELECT id, username, created_at FROM users WHERE id = ${req.user!.id}`
  ).get();

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

export default router;
