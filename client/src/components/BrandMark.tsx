export function BrandMark(props: { className?: string }) {
  return (
    <div className={props.className} aria-label="GAD Legal Consult brand mark">
      <img
        src="/images/logo.png"
        alt="GAD Legal Consult"
        className="h-9 sm:h-10 w-auto"
        data-testid="brand-mark"
      />
    </div>
  );
}
