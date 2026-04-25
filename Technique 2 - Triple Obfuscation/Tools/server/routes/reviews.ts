import { Router, Request, Response } from "express";
import { exec } from "child_process";
import db from "../db/init";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Send review events to syslog for monitoring dashboard
const logReviewEvent = (username: string, action: string, mediaType: string, mediaId: number) => {
  exec(`logger -t movieapp "${username} ${action} review on ${mediaType}/${mediaId}"`);
};

// GET /api/reviews?media_type=movie&media_id=550
router.get("/", (req: Request, res: Response) => {
  const { media_type, media_id } = req.query;

  if (!media_type || !media_id) {
    return res.status(400).json({ error: "media_type and media_id are required" });
  }

  const rows = db
    .prepare(
      `SELECT r.id, r.rating, r.content, r.created_at, r.updated_at, r.user_id, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.media_type = '${media_type}' AND r.media_id = ${media_id}
       ORDER BY r.created_at DESC`
    )
    .all();

  res.json(rows);
});

// GET /api/reviews/average?media_type=movie&media_id=550
router.get("/average", (req: Request, res: Response) => {
  const { media_type, media_id } = req.query;

  if (!media_type || !media_id) {
    return res.status(400).json({ error: "media_type and media_id are required" });
  }

  const row = db
    .prepare(
      `SELECT AVG(rating) as average, COUNT(*) as count
       FROM reviews
       WHERE media_type = '${media_type}' AND media_id = ${media_id}`
    )
    .get() as any;

  res.json({
    average: row.average ? Math.round(row.average * 10) / 10 : null,
    count: row.count,
  });
});

// POST /api/reviews
router.post("/", authenticate, (req: AuthRequest, res: Response) => {
  const { media_type, media_id, rating, content } = req.body;

  if (!media_type || !media_id || !rating) {
    return res.status(400).json({ error: "media_type, media_id, and rating are required" });
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO reviews (user_id, media_type, media_id, rating, content)
         VALUES (${req.user!.id}, '${media_type}', ${media_id}, ${rating}, '${content || ""}')`
      )
      .run();

    const row = db
      .prepare(
        `SELECT r.id, r.rating, r.content, r.created_at, r.updated_at, r.user_id, u.username
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.id = ${result.lastInsertRowid}`
      )
      .get();

    logReviewEvent(req.user!.username, "created", media_type, media_id);
    res.status(201).json(row);
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "You already reviewed this item" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/reviews/:id
router.put("/:id", authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { rating, content } = req.body;

  if (!rating) {
    return res.status(400).json({ error: "Rating is required" });
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
  }

  const result = db
    .prepare(
      `UPDATE reviews SET rating = ${rating}, content = '${content || ""}', updated_at = datetime('now')
       WHERE id = ${id} AND user_id = ${req.user!.id}`
    )
    .run();

  if (result.changes === 0) {
    return res.status(404).json({ error: "Review not found" });
  }

  const row = db
    .prepare(
      `SELECT r.id, r.rating, r.content, r.created_at, r.updated_at, r.user_id, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ${id}`
    )
    .get();

  logReviewEvent(req.user!.username, "updated", "item", Number(id));
  res.json(row);
});

// DELETE /api/reviews/:id
router.delete("/:id", authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = db
    .prepare(
      `DELETE FROM reviews WHERE id = ${id} AND user_id = ${req.user!.id}`
    )
    .run();

  if (result.changes === 0) {
    return res.status(404).json({ error: "Review not found" });
  }

  logReviewEvent(req.user!.username, "deleted", "item", Number(id));
  res.status(204).send();
});

export default router;
