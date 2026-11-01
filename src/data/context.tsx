import { createContext, useContext } from "react";
import { useParams, useRouteLoaderData } from "react-router";
import type { EngagementRepository, Workspace } from "../domain/types";

export const RepositoryContext = createContext<EngagementRepository | null>(
  null,
);
export const NavigationPreferencesContext = createContext({
  hideClientNames: false,
});

export function getEngagementLabel(
  workspace: Workspace,
  engagement: Workspace["engagements"][number],
  hideNames: boolean,
): string {
  return hideNames
    ? `Engagement ${String(workspace.engagements.findIndex((item) => item.id === engagement.id) + 1).padStart(2, "0")}`
    : engagement.client;
}

export function useWorkspace() {
  const workspace = useRouteLoaderData<Workspace>("workspace");
  const repository = useContext(RepositoryContext);
  const { hideClientNames } = useContext(NavigationPreferencesContext);
  if (!workspace || !repository)
    throw new Error("The engagement workspace is not available.");
  const displayName = (engagement: Workspace["engagements"][number]) =>
    getEngagementLabel(workspace, engagement, hideClientNames);
  return { workspace, repository, displayName };
}

export function useEngagement() {
  const context = useWorkspace();
  const { engagementId } = useParams();
  const engagement = context.workspace.engagements.find(
    (item) => item.id === engagementId,
  );
  if (!engagement)
    throw new Error(
      "This engagement is not available. Choose one from the workspace.",
    );
  return {
    ...context,
    engagement,
    clientLabel: context.displayName(engagement),
  };
}
