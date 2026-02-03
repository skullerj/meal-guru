import { type ButtonHTMLAttributes, forwardRef } from "react";
import Icon, { type IconName } from "./Icon";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  "aria-label": string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    "bg-amber-400 hover:bg-amber-500 text-stone-900 border-2 border-amber-600 shadow-md shadow-amber-900/20",
  secondary:
    "bg-stone-100 border-2 border-stone-400 text-stone-800 hover:bg-stone-200",
  success:
    "bg-emerald-500 hover:bg-emerald-600 text-stone-900 border-2 border-emerald-700 shadow-md shadow-emerald-900/20",
  danger: "border-2 border-red-400 text-red-800 hover:bg-red-100 bg-red-50",
  ghost:
    "text-stone-600 hover:text-stone-800 hover:bg-stone-100 border-2 border-transparent",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-3",
};

const iconSizes: Record<IconButtonSize, "xs" | "sm" | "md"> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

// Organic/asymmetric border radius for tribal style
const borderRadiusStyles: Record<IconButtonSize, string> = {
  sm: "6px 3px 8px 4px",
  md: "8px 4px 10px 6px",
  lg: "10px 5px 14px 8px",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles =
      "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500";
    const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

    const buttonClasses = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      disabledStyles,
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={buttonClasses}
        style={{ borderRadius: borderRadiusStyles[size] }}
        aria-label={ariaLabel}
        {...props}
      >
        <Icon
          name={loading ? "loading" : icon}
          size={iconSizes[size]}
          className={loading ? "animate-spin" : ""}
          aria-label={loading ? "Loading" : ariaLabel}
        />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
