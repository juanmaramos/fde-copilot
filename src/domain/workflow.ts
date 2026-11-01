import { stages } from "./stages";
import type { Engagement, Source } from "./types";

export function citedSourceIds(text: string): string[] {
  return [...new Set(text.match(/\b[ENS]\d+\b/g) ?? [])];
}

export function getCurrentStage(engagement: Engagement): number {
  const index = engagement.steps.findIndex(
    (step) => step.decision?.path !== "advance" || !step.decision.valid,
  );
  return index < 0 ? stages.length : index;
}

export function getGate(engagement: Engagement, stageIndex: number) {
  const definition = stages[stageIndex];
  const step = engagement.steps[stageIndex];
  if (!definition || !step) throw new Error("This stage does not exist.");
  const available = engagement.sources.filter(
    (source) => source.stageIndex === stageIndex && source.available,
  );
  const checks = definition.criteria.map(([key, label]) => {
    const source = available
      .filter((record) => Object.hasOwn(record.covers, key))
      .at(-1);
    return {
      key,
      label,
      source,
      result: source?.covers[key] ?? ("missing" as const),
    };
  });
  const authority = available.filter((record) => record.decision).at(-1);
  const authorityName =
    authority?.decisionBy?.trim() || authority?.by?.trim() || "";
  const missing = checks
    .filter((check) => check.result !== "pass")
    .map((check) => check.label);
  if (step.suggestion) missing.push("Review the proposed brief update.");
  if (!step.reviewed || step.text !== step.savedText)
    missing.push("Review and save the brief.");
  if (authority?.decision !== "advance")
    missing.push(
      `Record the ${definition.authority.toLowerCase()}’s permission to proceed.`,
    );
  if (authority?.decision === "advance" && !authorityName)
    missing.push("Name the person who authorized this next step.");
  const cited = new Set(citedSourceIds(step.text));
  const basis = new Set(
    [...checks.map((check) => check.source), authority]
      .filter((source): source is Source => !!source)
      .map((source) => source.id),
  );
  for (const id of basis)
    if (!cited.has(id))
      missing.push(`Link ${id} in the brief so its basis can be checked.`);
  if (stageIndex > getCurrentStage(engagement))
    missing.push("Complete the preceding stage first.");
  return {
    checks,
    authority,
    authorityName,
    missing,
    ready: missing.length === 0,
  };
}

export function reopenDecisions(
  engagement: Engagement,
  stageIndex: number,
  reason: string,
): void {
  let reopened = false;
  engagement.steps.forEach((step, index) => {
    if (
      index >= stageIndex &&
      step.decision?.path === "advance" &&
      step.decision.valid
    ) {
      step.decision.valid = false;
      reopened = true;
    }
  });
  if (reopened)
    engagement.events.push({ stageIndex, type: "Review reopened", reason });
}
