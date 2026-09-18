import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get(api.public.siteConfig.path, async (_req, res) => {
    const config = await storage.getPublicSiteConfig();
    res.json(config);
  });

  app.get(api.public.seo.path, async (req, res) => {
    const slug = String(req.params.slug || "");
    const page = await storage.getSeoPage(slug);
    if (!page) {
      return res.status(404).json({ message: "SEO page not found" });
    }
    res.json(page);
  });

  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      const created = await storage.createContactSubmission(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  app.post(api.newsletter.subscribe.path, async (req, res) => {
    try {
      const input = api.newsletter.subscribe.input.parse(req.body);
      const existing = await storage.getNewsletterSubscriptionByEmail(input.email);
      if (existing) {
        return res.status(409).json({ message: "Already subscribed" });
      }
      await storage.createNewsletterSubscription(input);
      res.status(201).json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  return httpServer;
}
