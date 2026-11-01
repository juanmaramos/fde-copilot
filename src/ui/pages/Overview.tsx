import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import { Link } from "react-router";
import { stages } from "../../domain/stages";
import { getCurrentStage, getGate } from "../../domain/workflow";
import type { DecisionPath } from "../../domain/types";
import { useEngagement } from "../../data/context";

const engagementPath = (engagementId: string, suffix: string) =>
  `/engagements/${encodeURIComponent(engagementId)}/${suffix}`;

const decisionNames: Record<DecisionPath, string> = {
  advance: "Proceed recorded",
  hold: "Wait",
  revise: "Revise",
  stop: "Do not proceed",
};

type StatusColor = "danger" | "info" | "secondary" | "success" | "warning";

function stageStatus(
  index: number,
  currentStage: number,
  decision?: { path: DecisionPath; valid: boolean },
  reviewed = false,
): { label: string; color: StatusColor } {
  if (decision) {
    if (!decision.valid) return { label: "Review reopened", color: "info" };
    const color =
      decision.path === "advance"
        ? "success"
        : decision.path === "hold"
          ? "warning"
          : decision.path === "stop"
            ? "danger"
            : "info";
    return { label: decisionNames[decision.path], color };
  }
  if (index < currentStage) return { label: "Completed", color: "secondary" };
  if (index === currentStage)
    return {
      label: reviewed ? "Brief reviewed" : "In progress",
      color: "secondary",
    };
  return { label: "Not started", color: "secondary" };
}

export function OverviewPage() {
  const { engagement } = useEngagement();
  const currentStage = getCurrentStage(engagement);
  const isComplete = currentStage === stages.length;
  const visibleIndex = Math.min(currentStage, stages.length - 1);
  const visibleStage = stages[visibleIndex]!;
  const visibleWork = engagement.steps[visibleIndex]!;
  const gate = getGate(engagement, visibleIndex);
  const nextStage =
    currentStage < stages.length - 1 ? stages[currentStage + 1] : undefined;
  const missingItems = gate.missing.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-6 text-default sm:px-8">
      <header className="mb-6">
        <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
          Overview
        </h1>
        <p className="mt-3 max-w-3xl text-sm">{engagement.problem}</p>
        <p className="mt-2 text-sm text-secondary">
          {engagement.operator}
          {engagement.constraint ? ` · ${engagement.constraint}` : ""}
        </p>
      </header>

      {isComplete ? (
        <section
          aria-labelledby="closed-heading"
          className="border-y border-default py-6"
        >
          <p className="text-sm text-secondary">
            All ten stage decisions are recorded.
          </p>
          <h2 id="closed-heading" className="mt-1 text-base font-semibold">
            Engagement closed
          </h2>
          <p className="mt-2 max-w-2xl text-secondary">
            The closure record and accepted responsibilities are available for
            review.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <TextLink as={Link} to={engagementPath(engagement.id, "delivery")}>
              Review delivery and closure
            </TextLink>
            <TextLink as={Link} to="/new">
              Start a new engagement
            </TextLink>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="current-stage-heading"
          className="border-y border-default py-6"
        >
          <p className="text-sm text-secondary">
            Current stage · {currentStage + 1} of {stages.length}
          </p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                id="current-stage-heading"
                className="text-base font-semibold"
              >
                {visibleStage.name}
              </h2>
              <p className="mt-1 text-secondary">{visibleStage.title}</p>
            </div>
            <TextLink
              as={Link}
              to={engagementPath(engagement.id, `work/${visibleStage.id}`)}
            >
              Open current stage
            </TextLink>
          </div>
          {nextStage && (
            <p className="mt-4 text-sm">
              Next: <span className="font-medium">{nextStage.name}</span>
              <span className="text-secondary"> · {nextStage.title}</span>
            </p>
          )}
          {missingItems.length > 0 && (
            <div className="mt-5">
              <h3 className="font-medium">Still needed for this decision</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
                {missingItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {gate.ready && !visibleWork.reviewed && (
            <p className="mt-4 text-sm text-secondary">
              The checks have source support. Review the brief before recording
              the decision.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="all-stages-heading" className="py-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="all-stages-heading" className="text-base font-semibold">
            All stages
          </h2>
          <TextLink
            as={Link}
            className="text-sm"
            to={engagementPath(engagement.id, "delivery")}
          >
            View delivery record
          </TextLink>
        </div>
        <ol className="divide-y divide-[var(--color-border)]">
          {stages.map((stage, index) => {
            const work = engagement.steps[index]!;
            const status = stageStatus(
              index,
              currentStage,
              work.decision,
              work.reviewed,
            );
            return (
              <li
                key={stage.id}
                className="flex flex-col items-start gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-secondary">Stage {index + 1}</p>
                  <TextLink
                    as={Link}
                    className="font-medium"
                    to={engagementPath(engagement.id, `work/${stage.id}`)}
                  >
                    {stage.name}
                  </TextLink>
                  <p className="mt-1 text-sm text-secondary">{stage.title}</p>
                </div>
                <Badge color={status.color}>{status.label}</Badge>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
