import nba from "../../../attached_assets/brand6.jpg";
import fintechNgr from "../../../attached_assets/brand7.jpg";
import citn from "../../../attached_assets/brand8.jpg";
import nbaSlp from "../../../attached_assets/brand9.jpg";
import nbaSbl from "../../../attached_assets/brand10.jpg";

// `zoom` crops built-in padding in the source images so seals and wordmarks read at similar weight.
const MEMBERSHIPS = [
  { src: nba, short: "NBA", name: "Nigerian Bar Association", zoom: "scale-100" },
  { src: nbaSbl, short: "NBA-SBL", name: "NBA Section on Business Law", zoom: "scale-150" },
  { src: nbaSlp, short: "NBA-SLP", name: "NBA Section on Legal Practice", zoom: "!w-auto aspect-square object-cover object-[46%_50%] rounded-full" },
  { src: fintechNgr, short: "FintechNGR", name: "Fintech Association of Nigeria", zoom: "scale-[2.2]" },
  { src: citn, short: "CITN", name: "Chartered Institute of Taxation of Nigeria", zoom: "scale-[1.35] [clip-path:circle(37%_at_53%_46%)]" },
];

export function MembershipBadges() {
  return (
    <div className="mt-7 max-w-2xl" data-testid="founder-memberships">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">Professional memberships</div>
      <ul className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
        {MEMBERSHIPS.map((m) => (
          <li key={m.short} className="flex flex-col items-center gap-2 text-center">
            <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-white p-2">
              <img src={m.src} alt={m.name} loading="lazy" className={`h-full w-full object-contain ${m.zoom}`} />
            </div>
            <span className="text-xs font-semibold text-foreground">{m.short}</span>
            <span className="sr-only">{m.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
