import type { ReactNode } from "react";

export function SectionCard({
  title, description, actions, children, className = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div>
            {title && <h3 className="font-semibold tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5 pt-0">{children}</div>
    </div>
  );
}