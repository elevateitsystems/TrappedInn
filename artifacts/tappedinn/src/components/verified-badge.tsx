import { cn } from "@/lib/utils";

export type VerificationLevel = "none" | "blue" | "gold" | "elite_black";

const SIZES = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
} as const;

const LEVEL_LABEL: Record<Exclude<VerificationLevel, "none">, string> = {
  blue: "Blue Verified",
  gold: "Gold Verified",
  elite_black: "Elite Black Verified",
};

type Props = {
  level: VerificationLevel | null | undefined;
  size?: keyof typeof SIZES;
  className?: string;
};

export function VerifiedBadge({ level, size = "md", className }: Props) {
  if (!level || level === "none") return null;

  const sizeClass = SIZES[size];
  const label = LEVEL_LABEL[level];

  const fill =
    level === "blue"
      ? "#1d9bf0"
      : level === "gold"
      ? "#C9A84C"
      : "#0a0a0a";
  const checkColor =
    level === "elite_black" ? "#C9A84C" : "#ffffff";
  const stroke = level === "elite_black" ? "#C9A84C" : undefined;

  return (
    <span
      title={label}
      aria-label={label}
      className={cn("inline-flex shrink-0 align-middle", sizeClass, className)}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
        <path
          d="M12 1.5l2.3 2.05 3.05-.35 1.3 2.8 2.8 1.3-.35 3.05L23.1 12.6l-2.05 2.3.35 3.05-2.8 1.3-1.3 2.8-3.05-.35L12 23.85l-2.3-2.05-3.05.35-1.3-2.8-2.8-1.3.35-3.05L.85 12.6l2.05-2.3-.35-3.05 2.8-1.3 1.3-2.8 3.05.35z"
          fill={fill}
          stroke={stroke}
          strokeWidth={stroke ? 0.8 : 0}
        />
        <path
          d="M9.4 15.6l-3-3 1.4-1.4 1.6 1.6 5.6-5.6 1.4 1.4z"
          fill={checkColor}
        />
      </svg>
    </span>
  );
}

export function getVerificationLabel(level: VerificationLevel | null | undefined): string | null {
  if (!level || level === "none") return null;
  return LEVEL_LABEL[level];
}
