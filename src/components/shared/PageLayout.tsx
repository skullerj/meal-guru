import type { ReactNode } from "react";
import Icon from "./Icon";

interface PageLayoutProps {
  title: string;
  subtitle?: ReactNode;
  backUrl?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function PageLayout({
  title,
  subtitle,
  backUrl,
  backLabel = "Back",
  actions,
  children,
}: PageLayoutProps) {
  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8">
      <header className="mb-8">
        {(backUrl || actions) && (
          <div className="flex items-center justify-between mb-4 h-9">
            {backUrl ? (
              <a
                href={backUrl}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="arrow-left" size="sm" />
                {backLabel}
              </a>
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
