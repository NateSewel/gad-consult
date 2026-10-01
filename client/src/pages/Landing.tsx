import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { TrustedCompanies } from "@/components/TrustedCompanies";
import { ContactForm } from "@/components/ContactForm";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { MetaManager } from "@/components/MetaManager";
import { FaqAccordion } from "@/components/FaqAccordion";
import { useSeo, useSiteConfig } from "@/hooks/use-public";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { scrollToId, scrollToTop } from "@/lib/gsap";
import { useReveal, useHeroIntro, useConnectorDraw } from "@/hooks/use-reveal";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Cpu,
  FileCheck,
  FileSignature,
  Gavel,
  Handshake,
  Landmark,
  MapPin,
  MessageSquare,
  PhoneCall,
  Quote,
  Scale,
  Shield,
  Sparkles,
  Timer,
  Trophy,
  Mail,
} from "lucide-react";

const SERVICES = [
  {
    title: "Corporate Law & Regulatory Compliance",
    description: "Structure, governance, and compliance guidance for startups and growing businesses.",
    icon: <Building2 className="h-5 w-5" />,
    closer: "Governance structures that hold up to regulator scrutiny.",
  },
  {
    title: "Fintech & Tech",
    description: "Legal support for fintech and technology companies navigating a fast-moving regulatory landscape.",
    icon: <Cpu className="h-5 w-5" />,
    closer: "Regulatory fluency for products that move faster than the rulebook.",
  },
  {
    title: "Fintech Licenses",
    description: "Licensing strategy and regulatory filings to get fintech ventures operating compliantly.",
    icon: <FileCheck className="h-5 w-5" />,
    closer: "Filed correctly the first time — no resubmission delays.",
  },
  {
    title: "Intellectual Property",
    description: "Protect your brand, creative works, and innovations with smart filings and strategy.",
    icon: <Sparkles className="h-5 w-5" />,
    closer: "Filed and defended — not just advised on.",
  },
  {
    title: "Taxation",
    description: "Practical tax advisory to keep your business compliant and efficiently structured.",
    icon: <Calculator className="h-5 w-5" />,
    closer: "Structured to stay compliant without overpaying.",
  },
  {
    title: "Sports & Entertainment",
    description: "Contracts, rights, and representation for athletes, artists, and entertainment ventures.",
    icon: <Trophy className="h-5 w-5" />,
    closer: "Contracts that protect the deal after the handshake.",
  },
  {
    title: "Corporate & Commercial Litigation",
    description: "Strategic representation — negotiation first, courtroom-ready when needed.",
    icon: <Gavel className="h-5 w-5" />,
    closer: "A negotiation-first approach that still shows up ready to litigate.",
  },
  {
    title: "Data Protection & Privacy",
    description: "Navigate data protection requirements with clear, actionable compliance steps.",
    icon: <Shield className="h-5 w-5" />,
    closer: "Compliance steps you can actually implement, not just a checklist.",
  },
  {
    title: "Real Estate",
    description: "Due diligence, documentation, and transaction support for property matters.",
    icon: <Landmark className="h-5 w-5" />,
    closer: "Due diligence that catches what a title search alone won't.",
  },
] as const;

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Share what's going on",
    desc: "Tell us about your situation through the contact form — the more context, the faster we can help.",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    step: "02",
    title: "Get a clear response",
    desc: "We review your message and reply with next steps, what to prepare, and how we can help.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    step: "03",
    title: "Move forward with confidence",
    desc: "From there, we schedule a consultation and get to work — with clarity on scope and timeline.",
    icon: <ArrowRight className="h-5 w-5" />,
  },
] as const;

const FAQS = [
  {
    q: "What areas of law do you handle?",
    a: "Corporate advisory, contract drafting and review, litigation and dispute resolution, property and real estate, employment and HR, regulatory compliance, intellectual property, and family and personal matters. If you're unsure where your situation fits, describe it in the contact form and we'll route you to the right service.",
  },
  {
    q: "Do you work with individuals, businesses, or both?",
    a: "Both. We advise startups and growing businesses on corporate and compliance matters, and support individuals with contracts, property, family, and personal legal needs.",
  },
  {
    q: "Is my information kept confidential?",
    a: "Yes. Sensitive matters are handled with discretion and professionalism, and contacting us does not create an attorney–client relationship until that's explicitly established.",
  },
  {
    q: "Where are you based — do you work outside Plateau State?",
    a: "We're based in Jos, Plateau State, Nigeria, and work with businesses and individuals across Nigeria and beyond.",
  },
  {
    q: "What happens after I submit the contact form?",
    a: "We review your message and respond with next steps — including guidance, timelines, and what to prepare for a consultation.",
  },
  {
    q: "What if my matter is urgent?",
    a: "Include \"Urgent\" in your message subject line and we'll prioritize a response.",
  },
  {
    q: "What are your office hours?",
    a: "Monday to Friday, 9:00am to 5:00pm. For anything time-sensitive outside those hours, flag it as urgent in your message.",
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Paul Nwankwo",
    service: null,
    quote:
      "It has been reassuring and effective working with you — from the first conversation, we felt confident we were in capable hands, and that consistency hasn't wavered.",
  },
  {
    name: "Arinze Anthony Eziokwu",
    service: "Registration of Company CAC",
    quote:
      "Excellent from start to finish. The CAC registration process was handled efficiently and with clear communication at every step — exactly what we needed to get our company up and running without delay.",
  },
  {
    name: "Godson Iyela",
    service: "Business Attorney",
    quote:
      "Smooth and great. GAD Legal Consult brought clarity and professionalism to matters that could easily have gotten complicated, and we always felt well represented.",
  },
  {
    name: "TWJ",
    service: "Legal Counsel",
    quote:
      "Awesome experience overall. Reliable legal counsel we can count on, with sound advice that gave us real confidence in our decisions.",
  },
] as const;

export default function Landing() {
  const { toast } = useToast();
  const { data: site } = useSiteConfig();
  const { data: seo } = useSeo("home");

  const [serviceFocus, setServiceFocus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useHeroIntro(rootRef);
  useConnectorDraw(rootRef);
  useReveal(rootRef);

  const org = site?.organization;
  const contact = site?.contact;
  const social = site?.social;

  const title = seo?.title ?? "GAD Legal Consult — Trusted Counsel for Modern Nigeria";
  const description =
    seo?.description ??
    "GAD Legal Consult helps individuals and businesses navigate Nigerian legal matters with clarity, strategy, and confidence. Schedule a consultation today.";

  const jsonLd = useMemo(() => {
    const name = org?.name ?? "GAD Legal Consult";
    const phone = contact?.phone;
    const email = contact?.email;
    const address = contact?.address;
    return [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name,
        url: window.location.origin,
        description,
        founder: org?.founder ?? "Victor Ayegbeni",
        telephone: phone,
        email,
        address: address
          ? {
              "@type": "PostalAddress",
              streetAddress: address,
              addressCountry: "NG",
            }
          : undefined,
        sameAs: [social?.instagram, social?.facebook, social?.youtube].filter(Boolean),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ];
  }, [org?.name, org?.founder, contact?.phone, contact?.email, contact?.address, social?.instagram, social?.facebook, social?.youtube, description]);

  function onSchedule() {
    scrollToId("contact");
    toast({
      title: "Schedule your consultation",
      description: "Share a few details below — we’ll follow up with times and next steps.",
    });
  }

  function onLearnMore(serviceTitle: string) {
    setServiceFocus(serviceTitle);
    scrollToId("contact");
    toast({
      title: "Tell us what you need",
      description: `Mention “${serviceTitle}” in your message so we can respond faster.`,
    });
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-legal-mesh">
      <MetaManager
        title={title}
        description={description}
        canonicalPath="/"
        og={{
          title,
          description,
          url: window.location.href,
        }}
        jsonLd={jsonLd}
      />

      <SiteHeader site={site ?? null} onSchedule={onSchedule} />

      <main>
        {/* HERO */}
        <section id="home" className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden" data-testid="section-home">
          <img
            src="/images/hero-bg.jpg"
            alt=""
            data-hero="bg"
            className="absolute left-0 top-[-15%] h-[130%] w-full object-cover will-change-transform"
            loading="eager"
            aria-hidden="true"
          />
          <div
            data-hero="veil"
            className="absolute inset-0 bg-gradient-to-b from-[#2B348C]/85 via-[#2B348C]/75 to-[#111111]/90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl">
              <div
                data-hero="kicker"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm"
              >
                <Scale className="h-3.5 w-3.5" />
                <span data-testid="hero-kicker">A modern Law Firm to meet Modern needs</span>
              </div>

              <h1
                data-hero="title"
                className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.05] text-white drop-shadow-lg"
                data-testid="hero-title"
              >
                Modern Legal Solutions for Your{" "}
                <span className="text-[#F69899]">Business</span>{" "}
                Success
              </h1>

              <p
                data-hero="desc"
                className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed drop-shadow"
                data-testid="hero-description"
              >
                Expert legal counsel in corporate law, fintech compliance, tax advisory, and real estate. Trusted by businesses across Nigeria and beyond.
              </p>

              <div
                data-hero="ctas"
                className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                data-testid="hero-cta-row"
              >
                <button
                  type="button"
                  onClick={onSchedule}
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold",
                    "bg-primary text-primary-foreground border border-primary-border",
                    "shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30",
                    "transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                  )}
                  data-testid="hero-primary-cta"
                >
                  Schedule Consultation
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToId("services")}
                  className="active:scale-[0.98] hover:-translate-y-0.5 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-7 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  data-testid="hero-secondary-cta"
                >
                  Explore Our Services
                </button>
              </div>

              <p
                data-hero="trust"
                className="mt-4 text-xs text-white/60"
                data-testid="hero-trust-line"
              >
                Confidential · No obligation to proceed
              </p>

              <div
                data-hero="stats"
                className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
                data-testid="hero-stats"
              >
                {[
                  { icon: Timer, title: "Fast Response", desc: "Clear next steps, quickly", testId: "hero-stat-1" },
                  { icon: BriefcaseBusiness, title: "Practical Expertise", desc: "Strategy that delivers", testId: "hero-stat-2" },
                  { icon: BadgeCheck, title: "Proven Results", desc: "Trusted by businesses", testId: "hero-stat-3" },
                ].map((stat, idx) => (
                  <div
                    key={stat.testId}
                    data-hero="stat"
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm px-4 py-3 cursor-default transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <stat.icon className="h-5 w-5 text-white/70 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white" data-testid={stat.testId}>{stat.title}</div>
                      <div className="text-xs text-white/55">{stat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TrustedCompanies />

        {/* SERVICES */}
        <section id="services" className="relative" data-testid="section-services">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
              <SectionHeading
                eyebrow="Services"
                title="Practical legal support across your key moments."
                description="Select the area you need help with — we’ll guide you from uncertainty to clear next steps."
                data-testid="services-heading"
              />

              <div className="w-full lg:w-auto">
                <div className="rounded-3xl border border-border/70 bg-card/60 px-5 py-4 shadow-sm backdrop-blur" data-testid="services-note">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">Not sure where you fit?</div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Use the contact form and describe your situation. We’ll route you to the right service.
                      </p>
                      <button
                        type="button"
                        onClick={() => scrollToId("contact")}
                        className="mt-3 inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-secondary hover:bg-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                        data-testid="services-note-cta"
                      >
                        Ask a quick question <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-testid="services-grid"
            >
              {SERVICES.map((s, idx) => (
                <ServiceCard
                  key={s.title}
                  title={s.title}
                  description={s.description}
                  closer={s.closer}
                  icon={s.icon}
                  onLearnMore={() => onLearnMore(s.title)}
                  data-testid={`service-${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="relative" data-testid="section-how-it-works">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              title="A simple path from first message to next steps."
              description="No jargon, no runaround — just a clear process from the moment you reach out."
              align="center"
              data-testid="how-it-works-heading"
            />

            <div className="relative mt-14">
              <div data-connector className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[1.375rem] hidden h-px bg-border md:block" />
              <div
                className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
                data-testid="how-it-works-grid"
              >
                {PROCESS_STEPS.map((step) => (
                  <div
                    key={step.step}
                    data-reveal
                    className="flex items-start gap-4 md:flex-col md:items-center md:text-center"
                    data-testid={`how-it-works-step-${step.step}`}
                  >
                    <div className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-8 ring-background">
                      {step.icon}
                    </div>
                    <div className="md:mt-5">
                      <div className="text-sm font-bold text-secondary">Step {step.step}</div>
                      <div className="mt-1 text-lg font-semibold leading-tight">{step.title}</div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed md:mx-auto md:max-w-[220px]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* ABOUT */}
        <section id="about" className="relative" data-testid="section-about">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5" data-testid="about-left">
                <SectionHeading
                  title="Attorney-led, detail-obsessed, built for real life."
                  description="Your matter deserves more than generic templates. We combine careful legal reasoning with practical execution."
                  data-testid="about-heading"
                />

                <div className="mt-8 grid gap-3" data-testid="about-points">
                  <FeatureLine icon={<BadgeCheck className="h-4 w-4" />} title="Clarity first" desc="You’ll understand options, risk, and next steps — in plain language." />
                  <FeatureLine icon={<Shield className="h-4 w-4" />} title="Discretion always" desc="Sensitive matters handled with confidentiality and professionalism." />
                  <FeatureLine icon={<Timer className="h-4 w-4" />} title="Momentum matters" desc="We prioritize the actions that unblock your timeline and protect your position." />
                </div>
              </div>

              <div className="lg:col-span-7" data-testid="about-right">
                <div className="rounded-3xl border border-border/70 bg-card p-7 sm:p-8 shadow-xl shadow-black/10 grain-overlay">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground shadow-lg shadow-secondary/20">
                      <Scale className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted-foreground" data-testid="founder-kicker">
                        Founder
                      </div>
                      <div className="mt-1 text-2xl leading-tight" data-testid="founder-name">
                        Victor Ayegbeni
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed" data-testid="founder-bio">
                        Victor leads GAD Legal Consult with a focus on practical outcomes — helping clients move from uncertainty to decisive action, whether that means drafting stronger contracts, navigating compliance, or resolving disputes strategically.
                      </p>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="about-metrics">
                        <AboutChip icon={<BriefcaseBusiness className="h-4 w-4" />} title="Business-minded counsel" desc="Legal strategy aligned to commercial reality." />
                        <AboutChip icon={<Gavel className="h-4 w-4" />} title="Dispute confidence" desc="Prepared to negotiate — or litigate." />
                      </div>

                      <button
                        type="button"
                        onClick={onSchedule}
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
                        data-testid="about-cta"
                      >
                        Work with us <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/95 to-secondary/70 p-6 shadow-lg shadow-secondary/20" data-testid="about-quote">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-white ring-1 ring-white/15">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">Our promise</div>
                      <p className="mt-1 text-sm text-white/85 leading-relaxed">
                        You’ll leave with a clearer picture of risk, options, and what to do next — not legal fog.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* OUR TEAM */}
        <section id="team" className="relative" data-testid="section-team">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              title="The people behind your legal strategy."
              description="A dedicated team of professionals committed to delivering clear, results-driven counsel."
              align="center"
              data-testid="team-heading"
            />

            <div
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-testid="team-grid"
            >
              <TeamCard
                imageSrc="/images/team-founder.jpg"
                name="Victor Ayegbeni"
                role="Founder & Principal Attorney"
                bio="Victor leads GAD Legal Consult with a focus on practical outcomes — helping clients move from uncertainty to decisive action across corporate, fintech, and compliance matters."
                isFounder
                testId="team-card-founder"
              />
              <TeamCard
                imageSrc="/images/team-member-1.jpg"
                name="Adaeze Nwosu"
                role="Associate Counsel"
                bio="Adaeze brings meticulous attention to contract drafting, regulatory compliance, and data privacy — ensuring clients stay ahead of evolving legal requirements."
                testId="team-card-member-1"
              />
              <TeamCard
                imageSrc="/images/team-member-2.jpg"
                name="Chukwudi Eze"
                role="Senior Legal Advisor"
                bio="Chukwudi specialises in real estate law, civil litigation, and arbitration — delivering strategic representation with a negotiation-first mindset."
                testId="team-card-member-2"
              />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* WHY CHOOSE US */}
        <section className="relative" data-testid="section-why">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              title="A sharper process — built around your outcomes."
              description="We don’t just advise. We map the path, reduce uncertainty, and execute with professional precision."
              align="center"
              data-testid="why-heading"
            />

            <div
              className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              data-testid="why-grid"
            >
              <WhyCard icon={<Shield className="h-5 w-5" />} title="Risk-aware guidance" desc="We help you anticipate issues and document decisions properly." closer="The paper trail that protects you if things go sideways." />
              <WhyCard icon={<Handshake className="h-5 w-5" />} title="Human, not robotic" desc="We explain clearly and collaborate with respect for your time." closer="No jargon dumps — just a straight answer to your question." />
              <WhyCard icon={<Landmark className="h-5 w-5" />} title="Nigeria-context expertise" desc="Practical advice grounded in the realities of local systems." closer="Built for how things actually work here, not a textbook." />
              <WhyCard icon={<FileSignature className="h-5 w-5" />} title="Documents that hold up" desc="Contracts and filings built to be enforceable, not generic." closer="Reviewed for the clause that gets argued over later." />
              <WhyCard icon={<Gavel className="h-5 w-5" />} title="Dispute readiness" desc="Strong positions and a negotiation-first mindset." closer="Positioned to settle fast, or hold firm if it goes further." />
              <WhyCard icon={<Timer className="h-5 w-5" />} title="Momentum-focused" desc="The work that unlocks your next milestone — prioritized." closer="Fewer status-check emails, more actual progress." />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* TESTIMONIALS */}
        <section className="relative" data-testid="section-testimonials">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              title="What our clients say."
              align="center"
              data-testid="testimonials-heading"
            />

            <div
              className="mt-10 space-y-6"
              data-testid="testimonials-grid"
            >
              <TestimonialCard
                name={TESTIMONIALS[1].name}
                service={TESTIMONIALS[1].service}
                quote={TESTIMONIALS[1].quote}
                testId="testimonial-card-1"
                featured
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[TESTIMONIALS[0], TESTIMONIALS[2], TESTIMONIALS[3]].map((t, idx) => (
                  <TestimonialCard key={t.name} name={t.name} service={t.service} quote={t.quote} testId={`testimonial-card-${idx + 2}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* FAQ */}
        <section id="faq" className="relative" data-testid="section-faq">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              title="Common questions before you reach out."
              align="center"
              data-testid="faq-heading"
            />

            <div
              data-reveal
              className="mt-10 mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card px-5 sm:px-7 shadow-sm"
              data-testid="faq-list"
            >
              <FaqAccordion items={FAQS} />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* CTA BAND */}
        <section className="relative" data-testid="section-cta-band">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-secondary/95 to-secondary/70 p-7 sm:p-10 shadow-xl shadow-secondary/20 grain-overlay">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
              </div>

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                    <Sparkles className="h-3.5 w-3.5" />
                    Conversion-focused consults
                  </div>
                  <h3 className="mt-4 text-3xl sm:text-4xl text-white leading-[1.05]" data-testid="cta-band-title">
                    Ready to move with confidence?
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl" data-testid="cta-band-desc">
                    If you’re dealing with uncertainty, risk, or documentation — a short conversation can save time and protect your position.
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch">
                  <button
                    type="button"
                    onClick={onSchedule}
                    className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-secondary shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                    data-testid="cta-band-primary"
                  >
                    Schedule Consultation
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToId("services")}
                    className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-white/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                    data-testid="cta-band-secondary"
                  >
                    View services
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* CONTACT */}
        <section id="contact" className="relative" data-testid="section-contact">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-5" data-testid="contact-left">
                <SectionHeading
                  title="Tell us what’s happening. We’ll respond with next steps."
                  description="Provide the essentials — we’ll reply with guidance, timelines, and what to prepare for a consultation."
                  data-testid="contact-heading"
                />

                <div className="mt-8 grid gap-4" data-testid="contact-info">
                  <InfoCard
                    icon={<PhoneCall className="h-5 w-5" />}
                    label="Phone"
                    value={contact?.phone ?? "+234 800 000 0000"}
                    onClick={() => {
                      navigator.clipboard?.writeText(contact?.phone ?? "+234 800 000 0000");
                      toast({ title: "Copied", description: "Phone number copied to clipboard." });
                    }}
                    actionLabel="Copy"
                    testId="contact-phone-card"
                  />
                  <InfoCard
                    icon={<Mail className="h-5 w-5" />}
                    label="Email"
                    value={contact?.email ?? "info@gadlegal.example"}
                    onClick={() => {
                      navigator.clipboard?.writeText(contact?.email ?? "info@gadlegal.example");
                      toast({ title: "Copied", description: "Email copied to clipboard." });
                    }}
                    actionLabel="Copy"
                    testId="contact-email-card"
                  />
                  <InfoCard
                    icon={<MapPin className="h-5 w-5" />}
                    label="Office"
                    value={contact?.address ?? "No. 4 Helen Gomwalk Way, off Old Airport Roundabout, Jos, Plateau State"}
                    onClick={() => {
                      navigator.clipboard?.writeText(contact?.address ?? "No. 4 Helen Gomwalk Way, off Old Airport Roundabout, Jos, Plateau State");
                      toast({ title: "Copied", description: "Address copied to clipboard." });
                    }}
                    actionLabel="Copy"
                    testId="contact-address-card"
                  />
                  <div data-reveal className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur" data-testid="contact-hours">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-secondary shadow-inner ring-1 ring-border/60">
                        <Timer className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">Office hours</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {contact?.officeHours ?? "Mon–Fri · 9:00am–5:00pm"}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          For urgent matters, include “Urgent” in your message subject line.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-border/70 bg-gradient-to-br from-card to-muted/60 p-6 shadow-sm" data-testid="contact-social">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">Follow</div>
                      <div className="mt-1 text-xs text-muted-foreground">Updates and insights.</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SocialBtn href={social?.instagram} label="Instagram" testId="social-instagram" />
                      <SocialBtn href={social?.facebook} label="Facebook" testId="social-facebook" />
                      <SocialBtn href={social?.youtube} label="YouTube" testId="social-youtube" />
                    </div>
                  </div>
                </div>
              </div>

              <div data-reveal className="lg:col-span-7" data-testid="contact-right">
                <ContactForm site={site ?? null} />
                {serviceFocus ? (
                  <div
                    className="mt-4 rounded-2xl animate-in fade-in slide-in-from-bottom-1 duration-300  border border-border/60 bg-muted/60 px-4 py-3 text-xs text-muted-foreground"
                    data-testid="service-focus-note"
                  >
                    Tip: You tapped <span className="font-semibold text-foreground/80">{serviceFocus}</span>. Mention it in your message for faster routing.
                    <button
                      type="button"
                      onClick={() => setServiceFocus(null)}
                      className="ml-2 rounded-lg px-2 py-1 font-semibold text-secondary hover:bg-muted/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
                      data-testid="service-focus-clear"
                    >
                      Clear
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/70 bg-background/70 backdrop-blur" data-testid="footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5" data-testid="footer-left">
                <div className="rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur">
                  <div className="font-display text-2xl leading-tight" data-testid="footer-brand">
                    {org?.name ?? "GAD Legal Consult"}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed" data-testid="footer-desc">
                    {org?.tagline ??
                      "Helping individuals and businesses navigate legal matters with clarity, strategy, and results."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground" data-testid="footer-mini">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-3 py-1.5">
                      <Shield className="h-3.5 w-3.5 text-secondary" />
                      Confidential
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-3 py-1.5">
                      <Gavel className="h-3.5 w-3.5 text-secondary" />
                      Dispute-ready
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-3 py-1.5">
                      <FileSignature className="h-3.5 w-3.5 text-secondary" />
                      Document-focused
                    </span>
                  </div>

                  <div className="mt-5 text-xs text-muted-foreground" data-testid="footer-founder">
                    Founder: <span className="font-semibold text-foreground/80">{org?.founder ?? "Victor Ayegbeni"}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4" data-testid="footer-middle">
                <FooterNewsletter />
              </div>

              <div className="lg:col-span-3" data-testid="footer-right">
                <div className="rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur">
                  <div className="text-sm font-semibold">Quick links</div>
                  <div className="mt-4 grid gap-2 text-sm" data-testid="footer-links">
                    <FooterLink label="Home" onClick={() => scrollToId("home")} testId="footer-link-home" />
                    <FooterLink label="Services" onClick={() => scrollToId("services")} testId="footer-link-services" />
                    <FooterLink label="About" onClick={() => scrollToId("about")} testId="footer-link-about" />
                    <Link
                      href="/blog"
                      className="text-left rounded-xl px-3 py-2 font-semibold text-foreground/85 hover:text-foreground hover:bg-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
                      data-testid="footer-link-blog"
                    >
                      Blog
                    </Link>
                    <FooterLink label="Contact" onClick={() => scrollToId("contact")} testId="footer-link-contact" />
                  </div>

                  <div className="mt-6 h-px bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
                  <div className="mt-4 text-xs text-muted-foreground leading-relaxed" data-testid="footer-disclaimer">
                    This website provides general information and does not constitute legal advice. Contacting us does not create an attorney–client relationship.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <div data-testid="footer-copyright">
                © {new Date().getFullYear()} {org?.name ?? "GAD Legal Consult"}. All rights reserved.
              </div>
              <button
                type="button"
                onClick={scrollToTop}
                className="rounded-xl px-3 py-2 font-semibold text-secondary hover:bg-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
                data-testid="back-to-top"
              >
                Back to top
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function TeamCard(props: {
  imageSrc: string;
  name: string;
  role: string;
  bio: string;
  isFounder?: boolean;
  testId: string;
}) {
  return (
    <div
      data-reveal
      className={cn(
        "group rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg",
        props.isFounder ? "border-primary/30" : "border-border/70",
      )}
      data-testid={props.testId}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-3xl">
        <img
          src={props.imageSrc}
          alt={props.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {props.isFounder && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
            <Scale className="h-3 w-3" />
            Founder
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="text-lg font-semibold leading-tight" data-testid={`${props.testId}-name`}>
          {props.name}
        </div>
        <div className="mt-1 text-xs font-semibold text-primary" data-testid={`${props.testId}-role`}>
          {props.role}
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed" data-testid={`${props.testId}-bio`}>
          {props.bio}
        </p>
      </div>
    </div>
  );
}

function FeatureLine(props: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      data-reveal
      className="group rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:translate-x-1 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
          {props.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{props.title}</div>
          <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{props.desc}</div>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard(props: { name: string; service: string | null; quote: string; testId: string; featured?: boolean }) {
  return (
    <div
      data-reveal
      className={cn(
        "group rounded-3xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-border",
        props.featured ? "p-8 sm:p-10" : "p-6",
      )}
      data-testid={props.testId}
    >
      <Quote className={cn("text-primary/40", props.featured ? "h-9 w-9" : "h-6 w-6")} />
      <p
        className={cn("leading-relaxed text-foreground", props.featured ? "mt-4 text-xl sm:text-2xl font-display max-w-2xl" : "mt-3 text-base")}
        data-testid={`${props.testId}-quote`}
      >
        "{props.quote}"
      </p>
      <div className={cn(props.featured ? "mt-6 text-base" : "mt-4 text-sm")}>
        <div className="font-semibold" data-testid={`${props.testId}-name`}>{props.name}</div>
        {props.service ? <div className="text-muted-foreground">{props.service}</div> : null}
      </div>
    </div>
  );
}

function AboutChip(props: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div data-reveal className="group rounded-3xl border border-border/60 bg-background/60 p-4 shadow-inner">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted text-secondary ring-1 ring-border/60 transition-transform duration-300 group-hover:scale-105">
          {props.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{props.title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{props.desc}</div>
        </div>
      </div>
    </div>
  );
}

function WhyCard(props: { icon: React.ReactNode; title: string; desc: string; closer: string }) {
  return (
    <div
      data-reveal
      className="group rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-border"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary/95 to-secondary/70 text-secondary-foreground shadow-md shadow-secondary/15 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
          {props.icon}
        </div>
        <div className="min-w-0">
          <div className="text-lg leading-tight">{props.title}</div>
          <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{props.desc}</div>
        </div>
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
      <div className="mt-4 text-xs text-muted-foreground">{props.closer}</div>
    </div>
  );
}

function InfoCard(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  actionLabel: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <div
      data-reveal
      className="group rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur transition-transform duration-200 hover:translate-x-1"
      data-testid={props.testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-secondary ring-1 ring-border/60 shadow-inner transition-transform duration-300 group-hover:scale-105">
            {props.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-muted-foreground">{props.label}</div>
            <div className="mt-1 text-sm font-semibold text-foreground/90 break-words" data-testid={`${props.testId}-value`}>
              {props.value}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={props.onClick}
          className="active:scale-95 hover:-translate-y-0.5 shrink-0 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-semibold text-foreground/85 shadow-sm hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
          data-testid={`${props.testId}-action`}
        >
          {props.actionLabel}
        </button>
      </div>
    </div>
  );
}

function SocialBtn(props: { href?: string; label: string; testId: string }) {
  const disabled = !props.href;
  return (
    <button
      type="button"
      onClick={() => {
        if (!props.href) return;
        window.open(props.href, "_blank", "noopener,noreferrer");
      }}
      className={cn(
        "rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-200",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:-translate-y-0.5 hover:shadow-md hover:border-border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10",
      )}
      disabled={disabled}
      data-testid={props.testId}
    >
      {props.label}
    </button>
  );
}

function FooterLink(props: { label: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="text-left rounded-xl px-3 py-2 font-semibold text-foreground/85 hover:text-foreground hover:bg-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
      data-testid={props.testId}
    >
      {props.label}
    </button>
  );
}
