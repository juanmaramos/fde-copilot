import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router";
import styles from "./WorkspaceNavigation.module.css";

export interface WorkspaceNavigationItem {
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
  active: boolean;
  count?: number;
}

export function WorkspaceNavigation({
  items,
}: {
  items: readonly WorkspaceNavigationItem[];
}) {
  return (
    <nav aria-label="Workspace" className={styles.navigation}>
      {items.map(({ name, Icon, to, active, count }) => (
        <Link
          key={name}
          to={to}
          aria-current={active ? "page" : undefined}
          className={styles.item}
        >
          <Icon className={styles.icon} aria-hidden="true" />
          <span>{name}</span>
          {count !== undefined && <span className={styles.count}>{count}</span>}
        </Link>
      ))}
    </nav>
  );
}
