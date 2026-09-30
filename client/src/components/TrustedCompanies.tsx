import { SectionHeading } from "@/components/SectionHeading";
import brand1 from "../../../attached_assets/brand1.jpg";
import brand2 from "../../../attached_assets/brand2.jpg";
import brand3 from "../../../attached_assets/brand3.jpg";
import brand4 from "../../../attached_assets/brand4.jpg";
import brand5 from "../../../attached_assets/brand5.jpg";

const LOGOS = [
  { src: brand1, alt: "Thulite Travels" },
  { src: brand2, alt: "HSB Global" },
  { src: brand3, alt: "Myswoop" },
  { src: brand4, alt: "Onfleek" },
  { src: brand5, alt: "WJ Hub" },
];

function LogoRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden={ariaHidden}>
      {LOGOS.map((logo, idx) => (
        <div
          key={`${logo.alt}-${idx}`}
          className="flex h-20 w-36 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-white shadow-sm"
        >
          <img
            src={logo.src}
            alt={logo.alt}
            className="max-h-14 max-w-28 object-contain grayscale opacity-70 transition duration-300 hover:grayscale-0 hover:opacity-100"
          />
        </div>
      ))}
    </div>
  );
}

export function TrustedCompanies() {
  return (
    <section className="relative py-16 sm:py-20" data-testid="section-trusted-companies">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Businesses that trust our counsel"
          align="center"
          data-testid="trusted-companies-heading"
        />
      </div>
      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex w-max animate-marquee">
          <LogoRow />
          <LogoRow ariaHidden />
        </div>
      </div>
    </section>
  );
}
