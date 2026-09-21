import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { ContactForm } from "@/components/ContactForm";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { MetaManager } from "@/components/MetaManager";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSeo, useSiteConfig } from "@/hooks/use-public";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  Scale,
  Shield,
  Sparkles,
  Timer,
  Trophy,
  Mail,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const SERVICES = [
  {
    title: "Corporate Law & Regulatory Compliance",
    description: "Structure, governance, and compliance guidance for startups and growing businesses.",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Fintech & Tech",
    description: "Legal support for fintech and technology companies navigating a fast-moving regulatory landscape.",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: "Fintech Licenses",
    description: "Licensing strategy and regulatory filings to get fintech ventures operating compliantly.",
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    title: "Intellectual Property",
    description: "Protect your brand, creative works, and innovations with smart filings and strategy.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Taxation",
    description: "Practical tax advisory to keep your business compliant and efficiently structured.",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    title: "Sports & Entertainment",
    description: "Contracts, rights, and representation for athletes, artists, and entertainment ventures.",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    title: "Corporate & Commercial Litigation",
    description: "Strategic representation — negotiation first, courtroom-ready when needed.",
    icon: <Gavel className="h-5 w-5" />,
  },
  {
    title: "Data Protection & Privacy",
    description: "Navigate data protection requirements with clear, actionable compliance steps.",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Real Estate",
    description: "Due diligence, documentation, and transaction support for property matters.",
    icon: <Landmark className="h-5 w-5" />,
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
    q: "Where are you based — do you work outside Lagos?",
    a: "We're based in Lagos, Nigeria, and work with businesses and individuals across Nigeria and beyond.",
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

function scrollToId(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing() {
  const { toast } = useToast();
  const { data: site } = useSiteConfig();
  const { data: seo } = useSeo("home");

  const [serviceFocus, setServiceFocus] = useState<string | null>(null);

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
    <div className="min-h-screen bg-legal-mesh">
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
          <motion.img
            src="/images/hero-bg.jpg"
            alt=""
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-[#2B348C]/85 via-[#2B348C]/75 to-[#111111]/90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Scale className="h-3.5 w-3.5" />
                </motion.div>
                <span data-testid="hero-kicker">A modern Law Firm to meet Modern needs</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.05] text-white drop-shadow-lg"
                data-testid="hero-title"
              >
                Modern Legal Solutions for Your{" "}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-[#F69899]"
                >
                  Business
                </motion.span>{" "}
                Success
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed drop-shadow"
                data-testid="hero-description"
              >
                Expert legal counsel in corporate law, fintech compliance, tax advisory, and real estate. Trusted by businesses across Nigeria and beyond.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                data-testid="hero-cta-row"
              >
                <motion.button
                  type="button"
                  onClick={onSchedule}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold",
                    "bg-[#EC1D21] text-white border border-[#EF3F42]",
                    "shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30",
                    "transition-shadow duration-200 ease-out",
                  )}
                  data-testid="hero-primary-cta"
                >
                  Schedule Consultation
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => scrollToId("services")}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-7 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  data-testid="hero-secondary-cta"
                >
                  Explore Our Services
                </motion.button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-4 text-xs text-white/60"
                data-testid="hero-trust-line"
              >
                Confidential · No obligation to proceed
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
                data-testid="hero-stats"
              >
                {[
                  { icon: Timer, title: "Fast Response", desc: "Clear next steps, quickly", testId: "hero-stat-1" },
                  { icon: BriefcaseBusiness, title: "Practical Expertise", desc: "Strategy that delivers", testId: "hero-stat-2" },
                  { icon: BadgeCheck, title: "Proven Results", desc: "Trusted by businesses", testId: "hero-stat-3" },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.testId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm px-4 py-3 cursor-default"
                  >
                    <stat.icon className="h-5 w-5 text-white/70 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white" data-testid={stat.testId}>{stat.title}</div>
                      <div className="text-xs text-white/55">{stat.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

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

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-testid="services-grid"
            >
              {SERVICES.map((s, idx) => (
                <ServiceCard
                  key={s.title}
                  title={s.title}
                  description={s.description}
                  icon={s.icon}
                  onLearnMore={() => onLearnMore(s.title)}
                  data-testid={`service-${idx + 1}`}
                />
              ))}
            </motion.div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="relative" data-testid="section-how-it-works">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              eyebrow="How it works"
              title="A simple path from first message to next steps."
              description="No jargon, no runaround — just a clear process from the moment you reach out."
              align="center"
              data-testid="how-it-works-heading"
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5"
              data-testid="how-it-works-grid"
            >
              {PROCESS_STEPS.map((step) => (
                <motion.div
                  key={step.step}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
                  data-testid={`how-it-works-step-${step.step}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-md shadow-primary/20">
                      {step.icon}
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">{step.step}</span>
                  </div>
                  <div className="mt-4 text-lg font-semibold leading-tight">{step.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* ABOUT */}
        <section id="about" className="relative" data-testid="section-about">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5" data-testid="about-left">
                <SectionHeading
                  eyebrow="About"
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
                <div className="rounded-[2rem] border border-border/70 bg-card p-7 sm:p-8 shadow-xl shadow-black/10 grain-overlay">
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
              eyebrow="Our Team"
              title="The people behind your legal strategy."
              description="A dedicated team of professionals committed to delivering clear, results-driven counsel."
              align="center"
              data-testid="team-heading"
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
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
            </motion.div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* WHY CHOOSE US */}
        <section className="relative" data-testid="section-why">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              eyebrow="Why choose us"
              title="A sharper process — built around your outcomes."
              description="We don’t just advise. We map the path, reduce uncertainty, and execute with professional precision."
              align="center"
              data-testid="why-heading"
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              data-testid="why-grid"
            >
              <WhyCard icon={<Shield className="h-5 w-5" />} title="Risk-aware guidance" desc="We help you anticipate issues and document decisions properly." />
              <WhyCard icon={<Handshake className="h-5 w-5" />} title="Human, not robotic" desc="We explain clearly and collaborate with respect for your time." />
              <WhyCard icon={<Landmark className="h-5 w-5" />} title="Nigeria-context expertise" desc="Practical advice grounded in the realities of local systems." />
              <WhyCard icon={<FileSignature className="h-5 w-5" />} title="Documents that hold up" desc="Contracts and filings built to be enforceable, not generic." />
              <WhyCard icon={<Gavel className="h-5 w-5" />} title="Dispute readiness" desc="Strong positions and a negotiation-first mindset." />
              <WhyCard icon={<Timer className="h-5 w-5" />} title="Momentum-focused" desc="The work that unlocks your next milestone — prioritized." />
            </motion.div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* FAQ */}
        <section id="faq" className="relative" data-testid="section-faq">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions before you reach out."
              align="center"
              data-testid="faq-heading"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card px-5 sm:px-7 shadow-sm"
              data-testid="faq-list"
            >
              <Accordion type="single" collapsible>
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={faq.q} value={`faq-${idx}`} data-testid={`faq-item-${idx + 1}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
        </section>

        {/* CTA BAND */}
        <section className="relative" data-testid="section-cta-band">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-secondary/95 to-secondary/70 p-7 sm:p-10 shadow-xl shadow-secondary/20 grain-overlay">
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
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5"
                data-testid="contact-left"
              >
                <SectionHeading
                  eyebrow="Contact"
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
                  <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur" data-testid="contact-hours">
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7"
                data-testid="contact-right"
              >
                <ContactForm site={site ?? null} />
                {serviceFocus ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 rounded-2xl border border-border/60 bg-muted/60 px-4 py-3 text-xs text-muted-foreground"
                    data-testid="service-focus-note"
                  >
                    Tip: You tapped <span className="font-semibold text-foreground/80">{serviceFocus}</span>. Mention it in your message for faster routing.
                    <motion.button
                      type="button"
                      onClick={() => setServiceFocus(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-2 rounded-lg px-2 py-1 font-semibold text-secondary hover:bg-muted/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
                      data-testid="service-focus-clear"
                    >
                      Clear
                    </motion.button>
                  </motion.div>
                ) : null}
              </motion.div>
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
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={cn(
        "group rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg",
        props.isFounder ? "border-primary/30" : "border-border/70",
      )}
      data-testid={props.testId}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-3xl">
        <motion.img
          src={props.imageSrc}
          alt={props.name}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {props.isFounder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#EC1D21] px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
          >
            <Scale className="h-3 w-3" />
            Founder
          </motion.div>
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
    </motion.div>
  );
}

function FeatureLine(props: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-md shadow-primary/20"
        >
          {props.icon}
        </motion.div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{props.title}</div>
          <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{props.desc}</div>
        </div>
      </div>
    </motion.div>
  );
}

function AboutChip(props: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-border/60 bg-background/60 p-4 shadow-inner"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-muted text-secondary ring-1 ring-border/60"
        >
          {props.icon}
        </motion.div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{props.title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{props.desc}</div>
        </div>
      </div>
    </motion.div>
  );
}

function WhyCard(props: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
      className="group rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-border"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.15 }}
          transition={{ duration: 0.3 }}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary/95 to-secondary/70 text-secondary-foreground shadow-md shadow-secondary/15 ring-1 ring-white/10"
        >
          {props.icon}
        </motion.div>
        <div className="min-w-0">
          <div className="text-lg leading-tight">{props.title}</div>
          <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{props.desc}</div>
        </div>
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-border/0 via-border/90 to-border/0" />
      <div className="mt-4 text-xs text-muted-foreground">Designed to reduce uncertainty — and keep you moving.</div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur"
      data-testid={props.testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-secondary ring-1 ring-border/60 shadow-inner"
          >
            {props.icon}
          </motion.div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-muted-foreground">{props.label}</div>
            <div className="mt-1 text-sm font-semibold text-foreground/90 break-words" data-testid={`${props.testId}-value`}>
              {props.value}
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={props.onClick}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-semibold text-foreground/85 shadow-sm hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
          data-testid={`${props.testId}-action`}
        >
          {props.actionLabel}
        </motion.button>
      </div>
    </motion.div>
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
