import { z } from "zod";
import {
  contactSubmissions,
  insertContactSubmissionSchema,
  insertNewsletterSubscriptionSchema,
  seoPages,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const phoneRegex = /^(\+234\d{10}|0\d{10})$/;

export const contactFormSchema = insertContactSubmissionSchema.extend({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[A-Za-z\s'.-]+$/, "Full name contains invalid characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .regex(
      phoneRegex,
      "Phone must be Nigerian format (+234XXXXXXXXXX or 0XXXXXXXXXX)",
    ),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const newsletterSchema = insertNewsletterSubscriptionSchema.extend({
  email: z.string().email("Please enter a valid email"),
});

export const api = {
  public: {
    siteConfig: {
      method: "GET" as const,
      path: "/api/public/site-config" as const,
      responses: {
        200: z.object({
          organization: z.object({
            name: z.string(),
            tagline: z.string(),
            founder: z.string(),
          }),
          contact: z.object({
            phone: z.string().optional(),
            email: z.string().optional(),
            address: z.string().optional(),
            officeHours: z.string().optional(),
          }),
          social: z.object({
            instagram: z.string().url().optional(),
            facebook: z.string().url().optional(),
            youtube: z.string().url().optional(),
          }),
        }),
      },
    },
    seo: {
      method: "GET" as const,
      path: "/api/public/seo/:slug" as const,
      responses: {
        200: z.custom<typeof seoPages.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  contact: {
    create: {
      method: "POST" as const,
      path: "/api/contact" as const,
      input: contactFormSchema,
      responses: {
        201: z.custom<typeof contactSubmissions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  newsletter: {
    subscribe: {
      method: "POST" as const,
      path: "/api/newsletter/subscribe" as const,
      input: newsletterSchema,
      responses: {
        201: z.custom<{ ok: true }>(),
        409: errorSchemas.conflict,
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SiteConfigResponse = z.infer<typeof api.public.siteConfig.responses[200]>;
export type SeoPageResponse = z.infer<typeof api.public.seo.responses[200]>;
export type ContactCreateInput = z.infer<typeof api.contact.create.input>;
export type ContactCreateResponse = z.infer<typeof api.contact.create.responses[201]>;
export type NewsletterSubscribeInput = z.infer<typeof api.newsletter.subscribe.input>;
export type NewsletterSubscribeResponse = z.infer<
  typeof api.newsletter.subscribe.responses[201]
>;
