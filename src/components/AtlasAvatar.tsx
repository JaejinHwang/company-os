import { cn } from "../lib/cn";

type Size = "xs" | "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  xs: "h-[18px] w-[18px]",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

// Notion 스타일 얼굴 일러스트 (DiceBear notionists-neutral, 토르소 없음).
// 인물 바꾸려면 seed=Atlas 부분만 교체.
const ATLAS_PHOTO =
  "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Atlas&backgroundColor=f7f4ed";

type Props = {
  size?: Size;
  className?: string;
};

export function AtlasAvatar({ size = "md", className }: Props) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-pill ring-1 ring-charcoal/10", SIZE[size], className)}>
      <img
        src={ATLAS_PHOTO}
        alt="Atlas"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </span>
  );
}
