import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

interface CardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

// Organic/asymmetric border radius for tribal style
const borderRadius = "12px 4px 16px 8px";

const CardButton = forwardRef<HTMLButtonElement, CardButtonProps>(
  ({ selected = false, disabled, className = "", children, ...props }, ref) => {
    const baseStyles =
      "block w-full border-2 p-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500";
    const selectedStyles = selected
      ? "border-amber-500 bg-amber-50"
      : "border-stone-300 bg-stone-50 hover:border-stone-400";
    const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

    const buttonClasses = [
      baseStyles,
      selectedStyles,
      disabledStyles,
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={buttonClasses}
        style={{ borderRadius }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CardButton.displayName = "CardButton";

export default CardButton;
