import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

interface CardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

const CardButton = forwardRef<HTMLButtonElement, CardButtonProps>(
  ({ selected = false, disabled, className = "", children, ...props }, ref) => {
    const baseStyles =
      "block w-full border rounded-lg p-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
    const selectedStyles = selected
      ? "border-blue-500 bg-blue-50"
      : "border-gray-300 hover:border-gray-400";
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
        {...props}
      >
        {children}
      </button>
    );
  }
);

CardButton.displayName = "CardButton";

export default CardButton;
