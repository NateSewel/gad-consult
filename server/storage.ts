import { eq } from "drizzle-orm";
import { db } from "./db";
import { contactSubmissions, newsletterSubscriptions, seoPages } from "@shared/schema";
import {
  type CreateContactSubmissionRequest,
  type ContactSubmissionResponse,
  type CreateNewsletterSubscriptionRequest,
  type PublicSiteConfigResponse,
  type SeoPageResponse,
} from "@shared/schema";

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
      "Founded by Victor Momodu, GAD Legal Consult is a forward-thinking law firm built to meet modern legal and regulatory needs.",
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
        founder: "Victor Momodu",
      },
      contact: {
        phone: undefined,
        email: undefined,
        address: undefined,
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
}

export const storage = new DatabaseStorage();
