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
  primary: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
  secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
  success:
    "bg-green-600 hover:bg-green-700 text-white border border-transparent",
  danger: "border border-red-300 text-red-700 hover:bg-red-50 bg-white",
  card: "border border-gray-300 hover:border-gray-400 bg-white text-gray-900",
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
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
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
