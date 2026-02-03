import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "card";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-400 hover:bg-amber-500 text-stone-900 border-2 border-amber-600 shadow-md shadow-amber-900/20",
  secondary:
    "bg-stone-100 border-2 border-stone-400 text-stone-800 hover:bg-stone-200",
  success:
    "bg-emerald-500 hover:bg-emerald-600 text-stone-900 border-2 border-emerald-700 shadow-md shadow-emerald-900/20",
  danger: "border-2 border-red-400 text-red-800 hover:bg-red-100 bg-red-50",
  card: "border-2 border-stone-400 hover:border-stone-500 bg-stone-50 text-stone-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const iconSizes: Record<ButtonSize, "xs" | "sm" | "md"> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

// Organic/asymmetric border radius for tribal style
const borderRadiusStyles: Record<ButtonSize, string> = {
  sm: "8px 3px 10px 5px",
  md: "12px 4px 16px 8px",
  lg: "16px 6px 20px 10px",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500";
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
        {...props}
      >
        {loading && (
          <Icon
            name="loading"
            size={iconSizes[size]}
            className="mr-2 animate-spin"
            aria-label="Loading"
          />
        )}
        {!loading && leftIcon && (
          <Icon name={leftIcon} size={iconSizes[size]} className="mr-2" />
        )}
        {children}
        {!loading && rightIcon && (
          <Icon name={rightIcon} size={iconSizes[size]} className="ml-2" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
