import { useMemo, useState } from "react";
import { useNewsletterSubscribe } from "@/hooks/use-newsletter";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = api.newsletter.subscribe.input;
type FormValues = z.infer<typeof schema>;

export function FooterNewsletter() {
  const { toast } = useToast();
  const mutation = useNewsletterSubscribe();
  const [success, setSuccess] = useState(false);

  const resolver = useMemo(() => zodResolver(schema), []);
  const form = useForm<FormValues>({
    resolver,
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: FormValues) {
    setSuccess(false);
    try {
      await mutation.mutateAsync(values);
      setSuccess(true);
      toast({
        title: "Subscribed",
        description: "You’ll get occasional updates and practical legal insights.",
      });
      form.reset();
    } catch (e: any) {
      const status = e?.status;
      if (status === 409) {
        toast({
          title: "Already subscribed",
          description: e?.message ?? "That email is already on our list.",
        });
        setSuccess(true);
        return;
      }
      toast({
        title: "Couldn’t subscribe",
        description: e?.message ?? "Please try again shortly.",
        variant: "destructive",
      });
    }
  }

  const emailError = form.formState.errors.email?.message;

  return (
    <div className="rounded-3xl border border-border/60 bg-card/50 p-5 sm:p-6 shadow-sm backdrop-blur" data-testid="footer-newsletter">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold" data-testid="newsletter-title">
            Get the brief
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed" data-testid="newsletter-subtitle">
            Occasional legal updates — concise, practical, and worth your time.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 grid gap-2" data-testid="newsletter-form">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            {...form.register("email")}
            placeholder="Email address"
            inputMode="email"
            className={cn(
              "h-12 w-full rounded-2xl border-2 border-border/70 bg-background px-4 text-sm shadow-inner placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200",
              emailError ? "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/10" : "",
            )}
            data-testid="newsletter-email-input"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            onClick={() => {}}
            className={cn(
              "h-12 rounded-2xl px-5 text-sm font-semibold",
              "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-lg shadow-secondary/20",
              "hover:shadow-xl hover:shadow-secondary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
              "transition-all duration-200 ease-out",
            )}
            data-testid="newsletter-submit"
          >
            {mutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining…
              </span>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>
        {emailError ? (
          <div className="text-xs font-semibold text-destructive" data-testid="newsletter-error">
            {emailError}
          </div>
        ) : success ? (
          <div className="text-xs font-semibold text-secondary" data-testid="newsletter-success">
            You’re on the list.
          </div>
        ) : (
          <div className="text-xs text-muted-foreground" data-testid="newsletter-helper">
            By subscribing you agree to receive emails from GAD Legal Consult.
          </div>
        )}
      </form>
    </div>
  );
}
