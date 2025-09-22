import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Edit3,
  Info,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export type IconName =
  | "check-circle"
  | "upload"
  | "loading"
  | "warning"
  | "arrow-left"
  | "reset"
  | "save"
  | "edit"
  | "delete"
  | "add"
  | "info"
  | "close"
  | "package";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  color?: string;
  "aria-label"?: string;
}

const iconMap = {
  "check-circle": CheckCircle,
  upload: Upload,
  loading: Loader2,
  warning: AlertTriangle,
  "arrow-left": ArrowLeft,
  reset: RotateCcw,
  save: Save,
  edit: Edit3,
  delete: Trash2,
  add: Plus,
  info: Info,
  close: X,
  package: Package,
} as const;

const sizeMap: Record<IconSize, number> = {
  xs: 16, // h-4 w-4
  sm: 20, // h-5 w-5
  md: 24, // h-6 w-6
  lg: 32, // h-8 w-8
  xl: 48, // h-12 w-12
};

export default function Icon({
  name,
  size = "md",
  className = "",
  color = "currentColor",
  "aria-label": ariaLabel,
  ...props
}: IconProps) {
  const IconComponent = iconMap[name];
  const iconSize = sizeMap[size];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={iconSize}
      color={color}
      className={className}
      aria-label={ariaLabel}
      role="img"
      aria-hidden={!ariaLabel}
      {...props}
    />
  );
}
