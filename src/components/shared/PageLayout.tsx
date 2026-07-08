import type { ReactNode } from "react";
import Icon from "./Icon";

interface PageLayoutProps {
  title: string;
  subtitle?: ReactNode;
  showBack?: boolean;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function PageLayout({
  title,
  subtitle,
  showBack = false,
  backLabel = "Back",
  actions,
  children,
}: PageLayoutProps) {
  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8">
      <header className="mb-8">
        {(showBack || actions) && (
          <div className="flex items-center justify-between mb-4 h-9">
            {showBack ? (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-0 bg-transparent p-0"
              >
                <Icon name="arrow-left" size="sm" />
                {backLabel}
              </button>
            ) : (
              <div />
            )}
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        )}
        <h1 className="text-3xl font-bold text-foreground font-heading">
          {title}
        </h1>
        {subtitle && <div className="mt-1">{subtitle}</div>}
      </header>
      {children}
    </main>
  );
}
