import { cn } from "../lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  xs: "h-4.5 w-4.5",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

const url = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=f7f4ed,efe6d4,e8dac3,e1cdb2,d4bfa3`;

type Props = {
  seed: string;
  alt?: string;
  size?: Size;
  className?: string;
};

export function PersonAvatar({ seed, alt, size = "md", className }: Props) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-pill ring-1 ring-charcoal/10",
        SIZE[size],
        className
      )}
    >
      <img
        src={url(seed)}
        alt={alt ?? seed}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </span>
  );
}
