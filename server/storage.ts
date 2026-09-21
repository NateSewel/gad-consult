import { eq, and, desc } from "drizzle-orm";
import { db } from "./db.js";
import { contactSubmissions, newsletterSubscriptions, seoPages, blogPosts } from "../shared/schema.js";
import {
  type CreateContactSubmissionRequest,
  type ContactSubmissionResponse,
  type CreateNewsletterSubscriptionRequest,
  type PublicSiteConfigResponse,
  type SeoPageResponse,
  type BlogPost,
  type InsertBlogPost,
} from "../shared/schema.js";

export interface IStorage {
  getPublicSiteConfig(): Promise<PublicSiteConfigResponse>;
  getSeoPage(slug: string): Promise<SeoPageResponse | undefined>;
  seedSeoPagesIfEmpty(): Promise<void>;

  createContactSubmission(
    input: CreateContactSubmissionRequest,
  ): Promise<ContactSubmissionResponse>;

  createNewsletterSubscription(
    input: CreateNewsletterSubscriptionRequest,
  ): Promise<void>;
  getNewsletterSubscriptionByEmail(email: string): Promise<{ email: string } | undefined>;

  listPublishedBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  listAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(input: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, input: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  listContactSubmissions(): Promise<ContactSubmissionResponse[]>;
}

const SEED_SEO_PAGES: SeoPageResponse[] = [
  {
    slug: "home",
    title: "GAD Legal Consult | Modern Legal Solutions",
    description:
      "Modern legal solutions for business success. Expert counsel in corporate law, fintech compliance, tax advisory, real estate, data privacy, arbitration, and litigation.",
  },
  {
    slug: "services",
    title: "Services | GAD Legal Consult",
    description:
      "Explore GAD Legal Consult services: tax advisory, fintech licensing, company registration, international registration, data privacy, real estate, arbitration, and civil litigation.",
  },
  {
    slug: "about",
    title: "About | GAD Legal Consult",
    description:
      "Founded by Victor Ayegbeni, GAD Legal Consult is a forward-thinking law firm built to meet modern legal and regulatory needs.",
  },
  {
    slug: "contact",
    title: "Contact | GAD Legal Consult",
    description:
      "Contact GAD Legal Consult to schedule a consultation. Share your needs and our team will respond promptly.",
  },
];

export class DatabaseStorage implements IStorage {
  async getPublicSiteConfig(): Promise<PublicSiteConfigResponse> {
    return {
      organization: {
        name: "GAD Legal Consult",
        tagline: "A modern Law Firm to meet Modern needs",
        founder: "Victor Ayegbeni",
      },
      contact: {
        phone: undefined,
        email: undefined,
        address: "No. 4 Helen Gomwalk Way, off Old Airport Roundabout, Jos, Plateau State",
        officeHours: undefined,
      },
      social: {
        instagram: undefined,
        facebook: undefined,
        youtube: undefined,
      },
    };
  }

  async getSeoPage(slug: string): Promise<SeoPageResponse | undefined> {
    const [page] = await db
      .select()
      .from(seoPages)
      .where(eq(seoPages.slug, slug));
    return page;
  }

  async seedSeoPagesIfEmpty(): Promise<void> {
    const existing = await db.select().from(seoPages).limit(1);
    if (existing.length > 0) return;
    await db.insert(seoPages).values(SEED_SEO_PAGES);
  }

  async createContactSubmission(
    input: CreateContactSubmissionRequest,
  ): Promise<ContactSubmissionResponse> {
    const [created] = await db
      .insert(contactSubmissions)
      .values(input)
      .returning();
    return created;
  }

  async getNewsletterSubscriptionByEmail(
    email: string,
  ): Promise<{ email: string } | undefined> {
    const [existing] = await db
      .select({ email: newsletterSubscriptions.email })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return existing;
  }

  async createNewsletterSubscription(
    input: CreateNewsletterSubscriptionRequest,
  ): Promise<void> {
    await db.insert(newsletterSubscriptions).values(input);
  }

  async listPublishedBlogPosts(): Promise<BlogPost[]> {
    return db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")));
    return post;
  }

  async listAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(input: InsertBlogPost): Promise<BlogPost> {
    const publishedAt = input.status === "published" ? new Date() : null;
    const [created] = await db
      .insert(blogPosts)
      .values({ ...input, publishedAt })
      .returning();
    return created;
  }

  async updateBlogPost(id: number, input: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existing = await this.getBlogPostById(id);
    if (!existing) return undefined;

    const publishedAt =
      input.status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt;

    const [updated] = await db
      .update(blogPosts)
      .set({ ...input, publishedAt, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    return result.length > 0;
  }

  async listContactSubmissions(): Promise<ContactSubmissionResponse[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }
}

export const storage = new DatabaseStorage();
