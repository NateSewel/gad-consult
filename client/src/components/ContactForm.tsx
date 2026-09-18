import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type ContactCreateInput } from "@shared/routes";
import { useCreateContactSubmission } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import type { SiteConfigResponse } from "@shared/routes";

export function ContactForm(props: { site?: SiteConfigResponse | null }) {
  const { toast } = useToast();
  const mutation = useCreateContactSubmission();

  const schema = useMemo(() => api.contact.create.input, []);
  const form = useForm<ContactCreateInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      serviceInterestedIn: "",
      message: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const err: any = mutation.error;
    if (err?.field) {
      form.setError(err.field as any, { message: err.message });
    }
  }, [mutation.error, form]);

  const contactEmail = props.site?.contact?.email;
  const contactPhone = props.site?.contact?.phone;

  async function onSubmit(values: ContactCreateInput) {
    try {
      await mutation.mutateAsync(values);
      toast({
        title: "Message sent",
        description: "We’ve received your request. We’ll respond as soon as possible.",
      });
      form.reset();
    } catch (e: any) {
      toast({
        title: "Couldn’t send message",
        description: e?.message ?? "Please try again in a moment.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-lg shadow-black/5" data-testid="contact-form-card">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-2xl leading-tight" data-testid="contact-form-title">
            Send a message
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed" data-testid="contact-form-subtitle">
            Tell us what you’re facing. We’ll reply with next steps, timelines, and what to prepare.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground/80">
          <ShieldCheck className="h-4 w-4 text-secondary" />
          Private & confidential
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4" data-testid="contact-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Full name"
            required
            testId="contact-fullName"
            error={form.formState.errors.fullName?.message}
          >
            <input
              {...form.register("fullName")}
              className={cn(inputClass, form.formState.errors.fullName ? errorRing : "")}
              placeholder="e.g., Adaeze Okafor"
              data-testid="contact-fullName-input"
            />
          </Field>

          <Field
            label="Email"
            required
            testId="contact-email"
            error={form.formState.errors.email?.message}
          >
            <input
              {...form.register("email")}
              className={cn(inputClass, form.formState.errors.email ? errorRing : "")}
              placeholder="you@example.com"
              inputMode="email"
              data-testid="contact-email-input"
            />
          </Field>

          <Field
            label="Phone (Nigeria)"
            required
            testId="contact-phone"
            error={form.formState.errors.phone?.message}
          >
            <input
              {...form.register("phone")}
              className={cn(inputClass, form.formState.errors.phone ? errorRing : "")}
              placeholder="+2348012345678 or 08012345678"
              inputMode="tel"
              data-testid="contact-phone-input"
            />
          </Field>

          <Field
            label="Service interested in"
            testId="contact-service"
            helper="Optional — helps us route your request."
            error={form.formState.errors.serviceInterestedIn?.message}
          >
            <select
              {...form.register("serviceInterestedIn")}
              className={cn(inputClass, "appearance-none", form.formState.errors.serviceInterestedIn ? errorRing : "")}
              data-testid="contact-service-select"
            >
              <option value="">Select a service</option>
              <option value="Corporate Advisory">Corporate Advisory</option>
              <option value="Contract Drafting & Review">Contract Drafting & Review</option>
              <option value="Litigation & Dispute Resolution">Litigation & Dispute Resolution</option>
              <option value="Property & Real Estate">Property & Real Estate</option>
              <option value="Employment & HR Advisory">Employment & HR Advisory</option>
              <option value="Regulatory Compliance">Regulatory Compliance</option>
              <option value="Intellectual Property">Intellectual Property</option>
              <option value="Family & Personal Matters">Family & Personal Matters</option>
            </select>
          </Field>
        </div>

        <Field
          label="Message"
          required
          testId="contact-message"
          error={form.formState.errors.message?.message}
          helper="Include key dates, parties involved, and what outcome you want."
        >
          <textarea
            {...form.register("message")}
            className={cn(inputClass, "min-h-[140px] resize-y", form.formState.errors.message ? errorRing : "")}
            placeholder="Briefly describe your situation..."
            data-testid="contact-message-textarea"
          />
        </Field>

        <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground" data-testid="contact-alt-info">
            Prefer email/phone?{" "}
            <span className="font-semibold text-foreground/80">
              {contactEmail ?? "info@gadlegal.example"}
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-foreground/80">
              {contactPhone ?? "+234 800 000 0000"}
            </span>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold overflow-hidden",
              "bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 text-secondary-foreground shadow-lg shadow-secondary/25",
              "hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
              "transition-all duration-300 ease-out",
            )}
            data-testid="contact-submit"
          >
            {/* Shimmer effect */}
            <span className="pointer-events-none absolute inset-0 shimmer" />
            
            {/* Gradient overlay */}
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(80%_120%_at_10%_10%,rgba(255,255,255,0.25),transparent_65%)]" />
            
            {mutation.isPending ? (
              <>
                <Loader2 className="relative z-10 h-4 w-4 animate-spin" /> 
                <span className="relative z-10">Sending…</span>
              </>
            ) : (
              <>
                <Send className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="relative z-10">Send message</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5" data-testid={props.testId}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold text-foreground/90">
          {props.label}{" "}
          {props.required ? <span className="text-primary">*</span> : null}
        </div>
        {props.helper ? <div className="text-xs text-muted-foreground">{props.helper}</div> : null}
      </div>
      {props.children}
      {props.error ? (
        <div className="text-xs font-semibold text-destructive" data-testid={`${props.testId}-error`}>
          {props.error}
        </div>
      ) : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/90 " +
  "focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-4 focus-visible:ring-secondary/10 transition-all duration-200";

const errorRing =
  "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/10";
