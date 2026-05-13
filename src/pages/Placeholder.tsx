type Props = {
  title: string;
  description: string;
};

export function Placeholder({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-[1200px]">
      <h2 className="text-section font-[600] tracking-[-1.2px] text-charcoal">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-[16px] leading-[1.5] text-charcoal-muted">
        {description}
      </p>

      <div className="card mt-8 grid h-[280px] place-items-center">
        <p className="text-[14px] text-charcoal-muted">
          This area is intentionally left blank — wire your content here.
        </p>
      </div>
    </div>
  );
}
