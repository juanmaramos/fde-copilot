import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useNavigation,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { ButtonLink } from "@openai/apps-sdk-ui/components/Button";
import {
  Document,
  Folder,
  Grid,
  Groups,
  Plus,
  Suitcase,
} from "@openai/apps-sdk-ui/components/Icon";
import { Tooltip } from "@openai/apps-sdk-ui/components/Tooltip";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import {
  getEngagementLabel,
  NavigationPreferencesContext,
  useWorkspace,
} from "../../data/context";
import { getCurrentStage } from "../../domain/workflow";
import { stages } from "../../domain/stages";
import { EngagementSwitcher } from "./EngagementSwitcher";
import {
  readSessionValue,
  writeSessionValue,
} from "../../data/browser-storage";

export function WorkspaceShell() {
  const { workspace } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [hideClientNames, setHideClientNames] = useState(
    () => readSessionValue("navigation-hide-names") === "true",
  );
  const selected =
    workspace.engagements.find((item) =>
      location.pathname.startsWith(`/engagements/${item.id}/`),
    ) ?? workspace.engagements[0];
  const base = `/engagements/${selected.id}`;
  const current = Math.min(getCurrentStage(selected), stages.length - 1);
  const selectedLabel = getEngagementLabel(
    workspace,
    selected,
    hideClientNames,
  );
  const links = [
    {
      name: "Overview",
      Icon: Grid,
      to: `${base}/overview`,
      active: location.pathname === `${base}/overview`,
    },
    {
      name: "Work",
      Icon: Document,
      to: `${base}/work/${stages[current].id}`,
      active:
        location.pathname.startsWith(`${base}/work/`) ||
        location.pathname === `${base}/context`,
    },
    {
      name: "Sources",
      Icon: Folder,
      to: `${base}/sources`,
      active: location.pathname.startsWith(`${base}/sources`),
    },
    {
      name: "Delivery",
      Icon: Suitcase,
      to: `${base}/delivery`,
      active: location.pathname === `${base}/delivery`,
    },
  ];
  useEffect(() => {
    document.title = `${selectedLabel} · fde studio`;
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.pathname, selectedLabel]);
  function toggleNames(hidden: boolean) {
    setHideClientNames(hidden);
    writeSessionValue("navigation-hide-names", String(hidden));
  }
  return (
    <NavigationPreferencesContext value={{ hideClientNames }}>
      <a
        className="absolute -top-20 left-4 z-50 rounded-md bg-surface px-4 py-3 focus:top-4"
        href="#main"
      >
        Skip to the work
      </a>
      <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:pb-0">
        <aside
          className="border-b border-default bg-surface-secondary px-4 py-3 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-b-0 md:px-5 md:py-7"
          aria-label="Engagement navigation"
        >
          <div className="flex items-center justify-between gap-3">
            <Link
              className="flex items-center gap-2 text-base font-medium tracking-tight"
              to={`${base}/overview`}
            >
              <Groups className="size-5" aria-hidden="true" />
              fde studio
            </Link>
            <div className="flex items-center gap-2">
              <Tooltip content="This preview uses prepared example records. Changes stay local. Nothing is sent to a client or deployed.">
                <span className="text-xs text-secondary md:hidden" tabIndex={0}>
                  Example ⓘ
                </span>
              </Tooltip>
              <Tooltip content="New engagement">
                <ButtonLink
                  as={Link}
                  to="/new"
                  color="secondary"
                  variant="ghost"
                  size="lg"
                  className="w-10"
                  aria-label="New engagement"
                >
                  <Plus aria-hidden="true" />
                </ButtonLink>
              </Tooltip>
            </div>
          </div>
          <div className="mt-3 md:mt-9">
            <EngagementSwitcher
              items={workspace.engagements.map((item) => ({
                id: item.id,
                label: getEngagementLabel(workspace, item, hideClientNames),
              }))}
              activeId={selected.id}
              onSelect={(id) => void navigate(`/engagements/${id}/overview`)}
              hideNames={hideClientNames}
              onHideNamesChange={toggleNames}
            />
          </div>
          <nav
            aria-label="Workspace"
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-20 grid w-[calc(100%-1.5rem)] max-w-72 -translate-x-1/2 grid-cols-4 gap-0.5 rounded-full border border-default bg-surface p-1 shadow-lg md:static md:mt-9 md:flex md:w-full md:max-w-none md:translate-x-0 md:flex-col md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none"
          >
            {links.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                aria-current={item.active ? "page" : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 text-xs md:flex-row md:justify-start md:gap-3 md:rounded-lg md:px-3 md:py-2 md:text-sm ${item.active ? "bg-surface-tertiary font-medium" : "text-secondary hover:bg-surface-tertiary"}`}
              >
                <item.Icon
                  className="size-4 md:size-[18px]"
                  aria-hidden="true"
                />
                {item.name}
                {item.name === "Sources" && (
                  <span className="ml-auto hidden text-xs text-secondary md:inline">
                    {selected.sources.length}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <p className="mt-auto hidden pt-8 text-xs text-secondary md:block">
            {selected.example ? "Example engagement" : "Engagement workspace"}
          </p>
        </aside>
        <div className="min-w-0">
          <header
            aria-label="Engagement header"
            className="hidden min-h-14 items-center justify-between gap-4 border-b border-default px-5 md:flex md:px-8"
          >
            <span className="truncate text-sm font-medium">
              {location.pathname === "/new" ? "New engagement" : selectedLabel}
            </span>
            <Tooltip content="This preview uses prepared example records. Changes stay local. Nothing is sent to a client or deployed.">
              <span className="text-xs text-secondary" tabIndex={0}>
                Example workspace <span aria-hidden="true">ⓘ</span>
              </span>
            </Tooltip>
          </header>
          <div
            id="main"
            className="@container text-sm outline-none"
            tabIndex={-1}
            aria-busy={navigation.state !== "idle"}
          >
            {navigation.state !== "idle" && (
              <div
                className="mb-4 flex items-center gap-2 text-sm text-secondary"
                role="status"
              >
                <LoadingIndicator />
                Opening…
              </div>
            )}
            <Outlet />
          </div>
        </div>
      </div>
      <ScrollRestoration />
    </NavigationPreferencesContext>
  );
}

export function WorkspaceLoading() {
  return (
    <div className="p-8 flex gap-3 items-center" role="status">
      <LoadingIndicator />
      Opening the workspace…
    </div>
  );
}

export function WorkspaceError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? "This page is not available."
      : "The workspace could not open this page."
    : error instanceof Error
      ? error.message
      : "The workspace could not open this page.";
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">We couldn’t open that view</h1>
      <p className="my-4 text-secondary" role="alert">
        {message}
      </p>
      <Link className="underline underline-offset-4" to="/">
        Return to the workspace
      </Link>
    </main>
  );
}
