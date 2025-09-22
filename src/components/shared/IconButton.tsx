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
  primary: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
  secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
  success:
    "bg-green-600 hover:bg-green-700 text-white border border-transparent",
  danger: "border border-red-300 text-red-700 hover:bg-red-50 bg-white",
  ghost:
    "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent",
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
      "inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
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
