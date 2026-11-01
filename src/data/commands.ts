import type { DecisionPath, WorkspaceCommand } from "../domain/types";

export function readCommand(form: FormData): {
  command: WorkspaceCommand;
  expectedRevision: number;
} {
  const raw = form.get("command");
  const revision = form.get("expectedRevision");
  const expectedRevision = Number(revision);
  if (
    typeof raw !== "string" ||
    raw.length > 500_000 ||
    typeof revision !== "string" ||
    !revision.trim() ||
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 0
  )
    throw new Error("The request is incomplete. Refresh and try again.");
  const input: unknown = JSON.parse(raw);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("The request has an invalid format.");
  const record = input as Record<string, unknown>;
  function text(key: string, optional = false): string {
    const value = record[key];
    if (optional && value === undefined) return "";
    if (typeof value !== "string")
      throw new Error(`The request is missing ${key}.`);
    return value;
  }
  const type = text("type");
  if (type === "create")
    return {
      expectedRevision,
      command: {
        type,
        client: text("client"),
        problem: text("problem"),
        operator: text("operator"),
        constraint: text("constraint", true),
      },
    };
  const engagementId = text("engagementId");
  if (
    type === "load-client-files" ||
    type === "load-folder" ||
    type === "load-call"
  )
    return { expectedRevision, command: { type, engagementId } };
  const stageIndex = record.stageIndex;
  if (
    typeof stageIndex !== "number" ||
    !Number.isInteger(stageIndex) ||
    stageIndex < 0 ||
    stageIndex > 9
  )
    throw new Error("Choose an existing stage.");
  let command: WorkspaceCommand;
  switch (type) {
    case "load-records":
      command = {
        type,
        engagementId,
        stageIndex,
        followup: record.followup === true,
      };
      break;
    case "save-brief":
      command = { type, engagementId, stageIndex, text: text("text") };
      break;
    case "use-update":
    case "keep-brief":
      command = { type, engagementId, stageIndex };
      break;
    case "add-context":
      command = {
        type,
        engagementId,
        stageIndex,
        body: text("body"),
        title: text("title", true),
      };
      break;
    case "decide": {
      const path = text("path");
      if (!["advance", "hold", "revise", "stop"].includes(path))
        throw new Error("Choose an existing decision.");
      command = {
        type,
        engagementId,
        stageIndex,
        path: path as DecisionPath,
        reason: text("reason"),
      };
      break;
    }
    default:
      throw new Error("This action is not supported.");
  }
  return { command, expectedRevision };
}
