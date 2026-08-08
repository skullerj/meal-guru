import {
  ArrowLeft,
  BookOpen,
  Check,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Edit3,
  Lightbulb,
  LightbulbOff,
  Loader2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Timer,
  Trash2,
  X,
} from "lucide-react";

export type IconName =
  | "arrow-left"
  | "book-open"
  | "check"
  | "chef-hat"
  | "chevron-down"
  | "chevron-right"
  | "edit"
  | "lightbulb"
  | "lightbulb-off"
  | "loader"
  | "pause"
  | "play"
  | "plus"
  | "rotate-ccw"
  | "shopping-cart"
  | "sparkles"
  | "timer"
  | "trash"
  | "x";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  "aria-label"?: string;
}

const iconMap = {
  "arrow-left": ArrowLeft,
  "book-open": BookOpen,
  check: Check,
  "chef-hat": ChefHat,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  edit: Edit3,
  lightbulb: Lightbulb,
  "lightbulb-off": LightbulbOff,
  loader: Loader2,
  pause: Pause,
  play: Play,
  plus: Plus,
  "rotate-ccw": RotateCcw,
  "shopping-cart": ShoppingCart,
  sparkles: Sparkles,
  timer: Timer,
  trash: Trash2,
  x: X,
} as const;

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export default function Icon({
  name,
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}: IconProps) {
  const IconComponent = iconMap[name];
  const px = sizeMap[size];

  if (!IconComponent) return null;

  return (
    <IconComponent
      size={px}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
}
