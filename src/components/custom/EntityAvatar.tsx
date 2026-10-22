import { cn } from "@/lib/utils";

/** Token colour pairs; a name always gets the same one. */
const PALETTE = [
  "bg-accent text-accent-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-primary text-primary-foreground",
  "bg-sidebar text-sidebar-accent-foreground",
  "bg-chart-5/40 text-foreground",
];

const SIZE_CLASS = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-14 text-lg",
};

function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((word) => /\p{L}/u.test(word));
  return words
    .slice(0, 2)
    .map((word) => word.match(/\p{L}/u)?.[0] ?? "")
    .join("")
    .toUpperCase();
}

function paletteFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

interface EntityAvatarProps {
  name: string;
  /** Organizations are rounded squares, people are circles. */
  kind?: "org" | "person";
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export function EntityAvatar({ name, kind = "person", size = "md", className }: EntityAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold tracking-tight select-none",
        kind === "org" ? (size === "lg" ? "rounded-xl" : "rounded-lg") : "rounded-full",
        SIZE_CLASS[size],
        paletteFor(name),
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
