import {
  createBrowserRouter,
  createMemoryRouter,
  redirect,
  type ActionFunctionArgs,
  type RouteObject,
} from "react-router";
import type { EngagementRepository } from "./domain/types";
import { readCommand } from "./data/commands";
import {
  WorkspaceError,
  WorkspaceLoading,
  WorkspaceShell,
} from "./ui/components/WorkspaceShell";

export function createWorkspaceRoutes(
  repository: EngagementRepository,
): RouteObject[] {
  async function action({ request }: ActionFunctionArgs) {
    try {
      const { command, expectedRevision } = readCommand(
        await request.formData(),
      );
      const workspace = await repository.execute(command, expectedRevision);
      return {
        notice:
          command.type === "save-brief"
            ? "Brief review saved. Permission to proceed remains a separate decision."
            : command.type === "decide"
              ? "Decision recorded."
              : command.type === "add-context"
                ? "Context added. Update the brief when its interpretation is ready."
                : "Workspace updated.",
        createdEngagementId:
          command.type === "create"
            ? workspace.engagements.at(-1)?.id
            : undefined,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "The change could not be saved. Try again.",
      };
    }
  }
  return [
    {
      id: "workspace",
      path: "/",
      loader: () => repository.read(),
      action,
      Component: WorkspaceShell,
      ErrorBoundary: WorkspaceError,
      HydrateFallback: WorkspaceLoading,
      children: [
        {
          index: true,
          loader: async () =>
            redirect(
              `/engagements/${(await repository.read()).engagements[0].id}/overview`,
            ),
        },
        {
          path: "new",
          lazy: async () => ({
            Component: (await import("./ui/pages/NewEngagement"))
              .NewEngagementPage,
          }),
        },
        {
          path: "engagements/:engagementId",
          ErrorBoundary: WorkspaceError,
          children: [
            {
              index: true,
              loader: ({ params }) =>
                redirect(`/engagements/${params.engagementId}/overview`),
            },
            {
              path: "overview",
              lazy: async () => ({
                Component: (await import("./ui/pages/Overview")).OverviewPage,
              }),
            },
            {
              path: "work/:stageId",
              lazy: async () => ({
                Component: (await import("./ui/pages/Stage")).StagePage,
              }),
            },
            {
              path: "sources",
              lazy: async () => ({
                Component: (await import("./ui/pages/Sources")).SourceListPage,
              }),
            },
            {
              path: "sources/:sourceId",
              lazy: async () => ({
                Component: (await import("./ui/pages/Sources"))
                  .SourceDetailPage,
              }),
            },
            {
              path: "context",
              lazy: async () => ({
                Component: (await import("./ui/pages/Context")).ContextPage,
              }),
            },
            {
              path: "delivery",
              lazy: async () => ({
                Component: (await import("./ui/pages/Delivery")).DeliveryPage,
              }),
            },
          ],
        },
        {
          path: "*",
          loader: () => {
            throw new Response("Page not found", { status: 404 });
          },
        },
      ],
    },
  ];
}

export function createWorkspaceRouter(
  repository: EngagementRepository,
  options?: { embedded: true; initialEntries?: string[] },
) {
  const routes = createWorkspaceRoutes(repository);
  return options?.embedded
    ? createMemoryRouter(routes, {
        initialEntries: options.initialEntries ?? ["/"],
      })
    : createBrowserRouter(routes);
}
