import {
  ArrowLeft,
  Check,
  ChefHat,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export type IconName =
  | "arrow-left"
  | "check"
  | "chef-hat"
  | "chevron-right"
  | "edit"
  | "loader"
  | "plus"
  | "shopping-cart"
  | "sparkles"
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
  check: Check,
  "chef-hat": ChefHat,
  "chevron-right": ChevronRight,
  edit: Edit3,
  loader: Loader2,
  plus: Plus,
  "shopping-cart": ShoppingCart,
  sparkles: Sparkles,
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
