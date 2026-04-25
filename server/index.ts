import express, { Request, Response } from "express";
import { exec } from "child_process";
import cors from "cors";
import authRoutes from "./routes/auth";
import watchlistRoutes from "./routes/watchlist";
import reviewRoutes from "./routes/reviews";
import winston from "winston"

const app = express();
const PORT = process.env.PORT || 3001;
const logger = module.exports = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  )
});


app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check endpoint - verify external service connectivity
app.get("/api/health", (req: Request, res: Response) => {
  exec(`ping -c 1 -W 2 api.themoviedb.org`, (err, stdout) => {
    res.json({
      status: err ? "unreachable" : "healthy",
      service,
      latency: stdout.match(/time=(\d+\.?\d*)/)?.[1] || null,
    });
  });

  logger.log('info', 'Health Check Requested:');
  logger.log('info', (req.query.service as string) || "api.themoviedb.org");

});

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
