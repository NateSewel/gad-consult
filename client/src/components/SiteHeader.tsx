import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";
import { PrimaryCTA } from "@/components/PrimaryCTA";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useActiveSection } from "@/hooks/use-active-section";
import { Menu, X } from "lucide-react";
import type { SiteConfigResponse } from "@shared/routes";

const NAV = [
  { label: "Home", href: "#home", testId: "nav-home" },
  { label: "Services", href: "#services", testId: "nav-services" },
  { label: "About", href: "#about", testId: "nav-about" },
  { label: "Contact", href: "#contact", testId: "nav-contact" },
] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteHeader(props: {
  site?: SiteConfigResponse | null;
  onSchedule: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(["home", "services", "about", "contact"]);

  const orgName = props.site?.organization?.name ?? "GAD Legal Consult";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = useMemo(() => NAV, []);

  function handleNavClick(href: string) {
    const id = href.replace("#", "");
    scrollToId(id);
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "transition-all duration-300",
      )}
      data-testid="site-header"
    >
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          "pt-3",
        )}
      >
        <div
          className={cn(
            "grain-overlay glass rounded-3xl px-4 sm:px-5 py-3",
            scrolled ? "shadow-lg" : "shadow-md",
            "transition-all duration-300",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="min-w-0"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#home");
              }}
              data-testid="logo-link"
              aria-label={orgName}
            >
              <BrandMark />
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {navItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "relative rounded-xl px-3 py-2 text-sm font-semibold",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
                      "transition-all duration-200",
                      isActive
                        ? "text-secondary bg-secondary/10"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/70",
                    )}
                    data-testid={item.testId}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-secondary rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle data-testid="header-theme-toggle" />
              <button
                type="button"
                onClick={() => handleNavClick("#contact")}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                data-testid="header-secondary-cta"
              >
                Get in touch
              </button>
              <PrimaryCTA
                label="Schedule Consultation"
                onClick={props.onSchedule}
                data-testid="header-primary-cta"
              />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle data-testid="mobile-theme-toggle" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl border border-border/70 bg-card/70 p-2.5 shadow-sm backdrop-blur transition-all duration-200 hover:bg-card hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                onClick={() => setOpen((v) => !v)}
                data-testid="mobile-menu-button"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div
            className={cn(
              "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
              open ? "max-h-80 opacity-100 mt-3" : "max-h-0 opacity-0",
            )}
            data-testid="mobile-menu"
          >
            <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm">
              <div className="grid gap-1">
                {navItems.map((item) => {
                  const sectionId = item.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
                        isActive
                          ? "text-secondary bg-secondary/10"
                          : "text-foreground/85 hover:bg-muted/70",
                      )}
                      data-testid={`${item.testId}-mobile`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => handleNavClick("#contact")}
                  className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-semibold text-foreground/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                  data-testid="mobile-secondary-cta"
                >
                  Get in touch
                </button>
                <PrimaryCTA
                  label="Schedule Consultation"
                  onClick={() => {
                    setOpen(false);
                    props.onSchedule();
                  }}
                  data-testid="mobile-primary-cta"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
