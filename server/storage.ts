import { eq, and, or, desc, gte, count } from "drizzle-orm";
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
    ipAddress: string | null,
  ): Promise<ContactSubmissionResponse>;

  countRecentContactSubmissions(
    ip: string | null,
    email: string,
    sinceMinutesAgo: number,
  ): Promise<number>;

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
    title: "GAD Consult | Modern Legal Solutions",
    description:
      "Expert legal counsel for businesses: corporate law, contracts, tech and fintech, tax, intellectual property, sports and entertainment, data protection, real estate and mining.",
  },
  {
    slug: "services",
    title: "Services | GAD Consult",
    description:
      "Explore GAD Consult services: corporate law and compliance, contracts and legal drafting, tech and fintech, fintech licences, intellectual property, tax, sports and entertainment, litigation, data protection, real estate and mining.",
  },
  {
    slug: "about",
    title: "About | GAD Consult",
    description:
      "Founded by Victor Ayegbeni, GAD Consult is a forward-thinking law firm built to meet modern legal and regulatory needs.",
  },
  {
    slug: "contact",
    title: "Contact | GAD Consult",
    description:
      "Contact GAD Consult to schedule a consultation. Share your needs and our team will respond promptly.",
  },
];

export class DatabaseStorage implements IStorage {
  async getPublicSiteConfig(): Promise<PublicSiteConfigResponse> {
    return {
      organization: {
        name: "GAD Consult",
        tagline: "A modern Law Firm to meet Modern needs",
        founder: "Victor Ayegbeni",
      },
      contact: {
        phone: "+2348166084797",
        altPhone: "+2347082651713",
        email: "gadlegalconsult@gmail.com",
        address: "No. 4 Helen Gomwalk Way, off Old Airport Roundabout, Jos, Plateau State",
        officeHours: undefined,
      },
      social: {
        instagram: "https://www.instagram.com/gadconsult",
        facebook: "https://www.facebook.com/profile.php?id=100083608446454",
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
    ipAddress: string | null,
  ): Promise<ContactSubmissionResponse> {
    const [created] = await db
      .insert(contactSubmissions)
      .values({ ...input, ipAddress })
      .returning();
    return created;
  }

  async countRecentContactSubmissions(
    ip: string | null,
    email: string,
    sinceMinutesAgo: number,
  ): Promise<number> {
    const since = new Date(Date.now() - sinceMinutesAgo * 60 * 1000);
    const matchCondition = ip
      ? or(eq(contactSubmissions.ipAddress, ip), eq(contactSubmissions.email, email))
      : eq(contactSubmissions.email, email);
    const [result] = await db
      .select({ count: count() })
      .from(contactSubmissions)
      .where(and(matchCondition, gte(contactSubmissions.createdAt, since)));
    return result?.count ?? 0;
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
