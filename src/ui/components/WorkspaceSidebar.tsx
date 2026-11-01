import type { ReactNode } from "react";

export function WorkspaceSidebar({
  header,
  children,
  footer,
}: {
  header: ReactNode;
  children: ReactNode;
  footer: string;
}) {
  return (
    <aside
      aria-label="Engagement navigation"
      className="border-b border-default bg-surface-secondary px-4 py-3 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:border-r md:border-b-0 md:px-5 md:py-7"
    >
      <div className="shrink-0">{header}</div>
      <div className="min-h-0 md:mt-9 md:flex-1 md:overflow-y-auto">
        {children}
      </div>
      <p className="hidden shrink-0 pt-8 text-xs text-secondary md:block">
        {footer}
      </p>
    </aside>
  );
}
