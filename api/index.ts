import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { registerRoutes } from "../server/routes.js";

const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody: unknown }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

const ready = registerRoutes(createServer(), app).then(() => {
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    res.status(status).json({ message });
  });
});

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  app(req, res);
}
