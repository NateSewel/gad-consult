export function BrandMark(props: { className?: string }) {
  return (
    <div className={props.className} aria-label="GAD Consult brand mark">
      <img
        src="/images/logo.png"
        alt="GAD Consult"
        className="h-9 sm:h-10 w-auto"
        data-testid="brand-mark"
      />
    </div>
  );
}
