import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Icon, { type IconName } from "./Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "success"
  | "danger";
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
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
  success:
    "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90 shadow-sm",
  danger:
    "bg-transparent text-destructive border border-destructive/40 hover:bg-destructive/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
};

const iconSizes: Record<ButtonSize, "xs" | "sm"> = {
  sm: "xs",
  md: "xs",
  lg: "sm",
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
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Icon name="loader" size={iconSizes[size]} className="animate-spin" />
        ) : (
          leftIcon && <Icon name={leftIcon} size={iconSizes[size]} />
        )}
        {children}
        {!loading && rightIcon && (
          <Icon name={rightIcon} size={iconSizes[size]} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
