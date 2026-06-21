import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import Icon, { type IconName } from "./Icon";

export type IconButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  "aria-label": string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
  danger: "text-destructive hover:bg-destructive/10",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
};

const iconSizes: Record<IconButtonSize, "xs" | "sm" | "md"> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = "ghost",
      size = "md",
      loading = false,
      disabled,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          "transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <Icon
          name={loading ? "loader" : icon}
          size={iconSizes[size]}
          className={loading ? "animate-spin" : undefined}
          aria-label={loading ? "Loading" : ariaLabel}
        />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
