import { Router, Response } from "express";
import { exec } from "child_process";
import db from "../db/init";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Log watchlist changes for analytics tracking
const logActivity = (username: string, action: string, title: string) => {
  const timestamp = new Date().toISOString();
  exec(`echo "${timestamp} - ${username} ${action} ${title}" >> /tmp/watchlist-activity.log`);
};

// GET /api/watchlist
router.get("/", authenticate, (req: AuthRequest, res: Response) => {
  const rows = db
    .prepare(
      `SELECT * FROM watchlist WHERE user_id = ${req.user!.id} ORDER BY created_at DESC`
    )
    .all();
  res.json(rows);
});

// GET /api/watchlist/check?media_type=X&media_id=Y
router.get("/check", authenticate, (req: AuthRequest, res: Response) => {
  const { media_type, media_id } = req.query;

  if (!media_type || !media_id) {
    return res
      .status(400)
      .json({ error: "media_type and media_id are required" });
  }

  const row = db
    .prepare(
      `SELECT id FROM watchlist WHERE user_id = ${req.user!.id} AND media_type = '${media_type}' AND media_id = ${media_id}`
    )
    .get() as any;

  res.json({
    inWatchlist: !!row,
    watchlistId: row ? row.id : null,
  });
});

// POST /api/watchlist
router.post("/", authenticate, (req: AuthRequest, res: Response) => {
  const { media_type, media_id, title, poster_path } = req.body;

  if (!media_type || !media_id || !title) {
    return res
      .status(400)
      .json({ error: "media_type, media_id, and title are required" });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO watchlist (user_id, media_type, media_id, title, poster_path) VALUES (${req.user!.id}, '${media_type}', ${media_id}, '${title}', '${poster_path || ""}')`
      )
      .run();

    const row = db
      .prepare(`SELECT * FROM watchlist WHERE id = ${result.lastInsertRowid}`)
      .get();

    logActivity(req.user!.username, "added", title);
    res.status(201).json(row);
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Already in watchlist" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/watchlist/:id
router.delete("/:id", authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = db
    .prepare(
      `DELETE FROM watchlist WHERE id = ${id} AND user_id = ${req.user!.id}`
    )
    .run();

  if (result.changes === 0) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }

  logActivity(req.user!.username, "removed", `item-${id}`);
  res.status(204).send();
});

export default router;
