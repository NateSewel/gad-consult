import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  requireAdminAuth,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE_SECONDS,
} from "./auth";

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

  app.get(api.blog.list.path, async (_req, res) => {
    const posts = await storage.listPublishedBlogPosts();
    res.json(posts);
  });

  app.get(api.blog.get.path, async (req, res) => {
    const slug = String(req.params.slug || "");
    const post = await storage.getPublishedBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
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

  app.post(api.admin.login.path, async (req, res) => {
    try {
      const input = api.admin.login.input.parse(req.body);
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      if (!adminEmail || !adminPasswordHash) {
        return res.status(500).json({ message: "Admin auth not configured" });
      }
      const emailMatches = input.email.toLowerCase() === adminEmail.toLowerCase();
      const passwordMatches = verifyPassword(input.password, adminPasswordHash);
      if (!emailMatches || !passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      res.cookie(SESSION_COOKIE_NAME, createSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
      });
      res.json({ ok: true });
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

  app.post(api.admin.logout.path, async (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    res.json({ ok: true });
  });

  app.get(api.admin.me.path, requireAdminAuth, async (_req, res) => {
    res.json({ authenticated: true });
  });

  app.get(api.admin.posts.list.path, requireAdminAuth, async (_req, res) => {
    const posts = await storage.listAllBlogPosts();
    res.json(posts);
  });

  app.get(api.admin.posts.get.path, requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const post = await storage.getBlogPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.post(api.admin.posts.create.path, requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.posts.create.input.parse(req.body);
      const created = await storage.createBlogPost(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      if ((err as any)?.code === "23505") {
        return res.status(409).json({ message: "A post with this slug already exists" });
      }
      throw err;
    }
  });

  app.put(api.admin.posts.update.path, requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.admin.posts.update.input.parse(req.body);
      const updated = await storage.updateBlogPost(id, input);
      if (!updated) return res.status(404).json({ message: "Post not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      if ((err as any)?.code === "23505") {
        return res.status(409).json({ message: "A post with this slug already exists" });
      }
      throw err;
    }
  });

  app.delete(api.admin.posts.remove.path, requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ ok: true });
  });

  return httpServer;
}
