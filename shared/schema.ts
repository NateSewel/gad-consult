import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceInterestedIn: text("service_interested_in"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(
  contactSubmissions,
).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(
  newsletterSubscriptions,
).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsletterSubscription = z.infer<
  typeof insertNewsletterSubscriptionSchema
>;
export type NewsletterSubscription =
  typeof newsletterSubscriptions.$inferSelect;

export const seoPages = pgTable("seo_pages", {
  slug: varchar("slug", { length: 128 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const insertSeoPageSchema = createInsertSchema(seoPages);

export type InsertSeoPage = z.infer<typeof insertSeoPageSchema>;
export type SeoPage = typeof seoPages.$inferSelect;

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImageUrl: text("cover_image_url"),
  bodyMarkdown: text("body_markdown").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type CreateContactSubmissionRequest = InsertContactSubmission;
export type ContactSubmissionResponse = ContactSubmission;

export type CreateNewsletterSubscriptionRequest = InsertNewsletterSubscription;
export type NewsletterSubscriptionResponse = NewsletterSubscription;

export type SeoPageResponse = SeoPage;

export interface OrganizationProfile {
  name: string;
  tagline: string;
  founder: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  officeHours?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export interface PublicSiteConfigResponse {
  organization: OrganizationProfile;
  contact: ContactInfo;
  social: SocialLinks;
}
