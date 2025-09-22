import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

export type CheckboxCardVariant = "blue" | "green";

interface CheckboxCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  checked?: boolean;
  variant?: CheckboxCardVariant;
  onToggle: () => void;
  children: ReactNode;
}

const variantStyles: Record<
  CheckboxCardVariant,
  { checked: string; unchecked: string; focus: string }
> = {
  green: {
    checked: "border-green-500 bg-green-50",
    unchecked: "border-gray-300 hover:border-gray-400",
    focus: "focus:ring-green-500",
  },
  blue: {
    checked: "border-blue-500 bg-blue-50",
    unchecked: "border-gray-300 hover:border-gray-400",
    focus: "focus:ring-blue-500",
  },
};

const CheckboxCard = forwardRef<HTMLButtonElement, CheckboxCardProps>(
  (
    {
      checked = false,
      variant = "green",
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
      "block w-full border rounded-lg p-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const checkedStyles = checked
      ? variantStyle.checked
      : variantStyle.unchecked;
    const focusStyles = variantStyle.focus;
    const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

    const buttonClasses = [
      baseStyles,
      checkedStyles,
      focusStyles,
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
