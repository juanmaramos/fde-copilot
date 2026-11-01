import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import { Link } from "react-router";
import { stages } from "../../domain/stages";
import { getCurrentStage, getGate } from "../../domain/workflow";
import type { Source } from "../../domain/types";
import { useEngagement } from "../../data/context";
import { SourceReferences } from "../components/SourceReferences";
import { EvidenceStatus } from "../components/EvidenceStatus";

const engagementPath = (engagementId: string, suffix: string) =>
  `/engagements/${encodeURIComponent(engagementId)}/${suffix}`;
const decisionLabels = {
  advance: "Proceed",
  hold: "Wait",
  revise: "Revise",
  stop: "Do not proceed",
} as const;

function EvidenceLink({
  engagementId,
  source,
  returnPath,
  returnLabel,
}: {
  engagementId: string;
  source: Source;
  returnPath: string;
  returnLabel: string;
}) {
  return (
    <SourceReferences
      engagementId={engagementId}
      references={[{ id: source.id, label: `${source.id} · ${source.title}` }]}
      returnTo={{ path: returnPath, label: returnLabel }}
    />
  );
}

export function DeliveryPage() {
  const { engagement, clientLabel } = useEngagement();
  const currentStage = getCurrentStage(engagement);
  const allDecisionsRecorded = currentStage === stages.length;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-6 text-default sm:px-8">
      <header className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-secondary">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <TextLink
                as={Link}
                to={engagementPath(engagement.id, "overview")}
              >
                {clientLabel}
              </TextLink>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Delivery record</li>
          </ol>
        </nav>
        <p className="mb-2 text-sm text-secondary">
          Stage evidence and decisions
        </p>
        <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
          Delivery record
        </h1>
        <p className="mt-3 max-w-3xl text-sm">
          {clientLabel} · {engagement.problem}
        </p>
      </header>

      <section
        className="mb-7 border-y border-default py-5"
        aria-label="Engagement status"
      >
        <p className="font-medium">
          {allDecisionsRecorded
            ? "All ten stage decisions are recorded."
            : `Current stage: ${stages[Math.min(currentStage, stages.length - 1)]!.name}.`}
        </p>
        <p className="mt-1 text-sm text-secondary">
          Each stage keeps its checks, cited records, review state and authority
          decision together. A completed check does not replace the next
          authority’s decision.
        </p>
      </section>

      <ol className="divide-y divide-[var(--color-border)]">
        {stages.map((stage, index) => {
          const work = engagement.steps[index]!;
          const gate = getGate(engagement, index);
          const stagePath = engagementPath(engagement.id, `work/${stage.id}`);
          return (
            <li key={stage.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-secondary">Stage {index + 1}</p>
                  <h2 className="text-base font-semibold">{stage.name}</h2>
                  <p className="mt-1 text-secondary">{stage.document}</p>
                </div>
                <TextLink as={Link} className="text-sm" to={stagePath}>
                  Open stage
                </TextLink>
              </div>

              <h3 className="mt-5 font-medium">Stage checks</h3>
              <ul className="mt-2 space-y-3">
                {gate.checks.map((check) => {
                  return (
                    <li
                      key={check.key}
                      className="flex flex-col gap-2 border-b border-default pb-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p>{check.label}</p>
                        {check.source && (
                          <EvidenceLink
                            engagementId={engagement.id}
                            source={check.source}
                            returnPath={stagePath}
                            returnLabel={stage.name.toLowerCase()}
                          />
                        )}
                      </div>
                      <EvidenceStatus
                        result={check.result}
                        reviewed={work.reviewed}
                      />
                    </li>
                  );
                })}
              </ul>

              {gate.missing.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium">Open items</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
                    {gate.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <section
                aria-label={`${stage.name} brief review`}
                className="mt-5"
              >
                <h3 className="font-medium">Brief review</h3>
                {work.reviewed ? (
                  <>
                    <Badge color="secondary" className="mt-2">
                      Saved for review
                    </Badge>
                    <p className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-sm text-secondary">
                      {work.savedText}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-secondary">
                    No brief review has been saved.
                  </p>
                )}
              </section>

              <section
                aria-label={`${stage.name} authority decision`}
                className="mt-5 border-l-2 border-default pl-4"
              >
                <h3 className="font-medium">
                  Authority decision · {stage.authority}
                </h3>
                {gate.authority && (
                  <div className="mt-2">
                    <p className="text-sm">
                      {gate.authority.decisionBy ?? gate.authority.by}
                      {gate.authority.decisionSummary
                        ? ` · ${gate.authority.decisionSummary}`
                        : ""}
                    </p>
                    <EvidenceLink
                      engagementId={engagement.id}
                      source={gate.authority}
                      returnPath={stagePath}
                      returnLabel={stage.name.toLowerCase()}
                    />
                  </div>
                )}
                {work.decision ? (
                  <div className="mt-3">
                    <p className="font-medium">
                      {decisionLabels[work.decision.path]}
                      {work.decision.valid
                        ? " recorded"
                        : " recorded with open requirements"}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      {work.decision.reason}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      Decision authority: {work.decision.authority}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-secondary">
                    No stage decision recorded.
                  </p>
                )}
              </section>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
