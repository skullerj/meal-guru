import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

export type CheckboxCardVariant = "amber" | "emerald" | "stone";

interface CheckboxCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  checked?: boolean;
  variant?: CheckboxCardVariant;
  onToggle: () => void;
  children: ReactNode;
}

const variantStyles: Record<
  CheckboxCardVariant,
  { checked: string; unchecked: string }
> = {
  emerald: {
    checked: "border-emerald-500 bg-emerald-50",
    unchecked: "border-stone-300 bg-stone-50 hover:border-stone-400",
  },
  amber: {
    checked: "border-amber-500 bg-amber-50",
    unchecked: "border-stone-300 bg-stone-50 hover:border-stone-400",
  },
  stone: {
    checked: "border-stone-500 bg-stone-100",
    unchecked: "border-stone-300 bg-stone-50 hover:border-stone-400",
  },
};

// Organic/asymmetric border radius for tribal style
const borderRadius = "12px 4px 16px 8px";

const CheckboxCard = forwardRef<HTMLButtonElement, CheckboxCardProps>(
  (
    {
      checked = false,
      variant = "emerald",
      onToggle,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const baseStyles =
      "block w-full border-2 p-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500";
    const checkedStyles = checked
      ? variantStyle.checked
      : variantStyle.unchecked;
    const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

    const buttonClasses = [
      baseStyles,
      checkedStyles,
      disabledStyles,
      className,
    ].join(" ");

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={-1}
        disabled={disabled}
        className={buttonClasses}
        style={{ borderRadius }}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CheckboxCard.displayName = "CheckboxCard";

export default CheckboxCard;
