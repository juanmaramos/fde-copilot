import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button, ButtonLink } from "@openai/apps-sdk-ui/components/Button";
import { Select } from "@openai/apps-sdk-ui/components/Select";
import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Link,
  useBlocker,
  useFetcher,
  useNavigate,
  useParams,
} from "react-router";
import { stages } from "../../domain/stages";
import {
  citedSourceIds,
  getCurrentStage,
  getGate,
} from "../../domain/workflow";
import type {
  DecisionPath,
  RecordedDecision,
  Source,
  WorkspaceCommand,
} from "../../domain/types";
import { useEngagement } from "../../data/context";
import { SourceReferences } from "../components/SourceReferences";
import { EvidenceStatus } from "../components/EvidenceStatus";

const decisionPaths: { value: DecisionPath; label: string }[] = [
  { value: "advance", label: "Proceed" },
  { value: "hold", label: "Wait" },
  { value: "revise", label: "Revise" },
  { value: "stop", label: "Do not proceed" },
];

const engagementPath = (engagementId: string, suffix: string) =>
  `/engagements/${encodeURIComponent(engagementId)}/${suffix}`;

function DecisionStatus({ decision }: { decision: RecordedDecision }) {
  if (!decision.valid) return <Badge color="info">Review reopened</Badge>;
  const path = decision.path;
  const label =
    decisionPaths.find((item) => item.value === path)?.label ?? path;
  const color =
    path === "advance"
      ? "success"
      : path === "hold"
        ? "warning"
        : path === "stop"
          ? "danger"
          : "info";
  return <Badge color={color}>{label}</Badge>;
}

function SourceLinkList({
  engagementId,
  sources,
  returnTo,
}: {
  engagementId: string;
  sources: Source[];
  returnTo: { path: string; label: string };
}) {
  return (
    <SourceReferences
      engagementId={engagementId}
      references={sources.map((source) => ({
        id: source.id,
        label: `${source.id} · ${source.title}`,
      }))}
      returnTo={returnTo}
    />
  );
}

export function StagePage() {
  const { engagement, workspace, clientLabel } = useEngagement();
  const { stageId = "qualification" } = useParams();
  const navigate = useNavigate();
  const fetcher = useFetcher<{ error?: string; notice?: string }>();
  const stagePickerId = useId();
  const decisionPickerId = useId();
  const requestedStageIndex = stages.findIndex((stage) => stage.id === stageId);
  const knownStage = requestedStageIndex >= 0;
  const stageIndex = Math.max(0, requestedStageIndex);
  const stage = stages[stageIndex]!;
  const work = engagement.steps[stageIndex]!;
  const stageSources = engagement.sources.filter(
    (source) => source.stageIndex === stageIndex,
  );
  const gate = getGate(engagement, stageIndex);
  const currentStage = getCurrentStage(engagement);
  const canAct =
    knownStage && stageIndex <= currentStage && currentStage < stages.length;
  const isFutureStage = stageIndex > currentStage;
  const stagePath = engagementPath(engagement.id, `work/${stage.id}`);
  const [briefText, setBriefText] = useState(work.text);
  const [decisionPath, setDecisionPath] = useState<DecisionPath>(
    work.decision?.path ?? "advance",
  );
  const [decisionReason, setDecisionReason] = useState(
    work.decision?.reason ?? "",
  );
  const submittedCommandType = useRef<WorkspaceCommand["type"] | null>(null);
  const changedSinceSaved = briefText !== work.text;
  const decisionChanged =
    decisionPath !== (work.decision?.path ?? "advance") ||
    decisionReason !== (work.decision?.reason ?? "");
  const hasUnsavedChanges = changedSinceSaved || decisionChanged;
  const blocker = useBlocker(knownStage && hasUnsavedChanges);
  const canEditBrief = canAct && (work.loaded || !engagement.example);

  useEffect(() => {
    if (
      fetcher.state !== "idle" ||
      !fetcher.data ||
      !submittedCommandType.current
    )
      return;
    const commandType = submittedCommandType.current;
    submittedCommandType.current = null;
    if (fetcher.data.error) return;
    if (
      ["save-brief", "use-update", "load-client-files"].includes(commandType) ||
      (commandType === "load-records" && !work.followup)
    ) {
      setBriefText(work.text);
    }
    if (commandType === "decide") {
      setDecisionPath(work.decision?.path ?? "advance");
      setDecisionReason(work.decision?.reason ?? "");
    }
  }, [
    fetcher.state,
    fetcher.data,
    work.text,
    work.decision?.path,
    work.decision?.reason,
  ]);

  useEffect(() => {
    setBriefText(work.text);
    setDecisionPath(work.decision?.path ?? "advance");
    setDecisionReason(work.decision?.reason ?? "");
  }, [engagement.id, stageIndex]);

  const citedIds = useMemo(() => citedSourceIds(briefText), [briefText]);
  const citedSources = stageSources.filter((source) =>
    citedIds.includes(source.id),
  );
  const loadCommand: WorkspaceCommand | null =
    stageIndex === 0
      ? { type: "load-client-files", engagementId: engagement.id }
      : { type: "load-records", engagementId: engagement.id, stageIndex };
  const canLoadFollowup = Boolean(
    work.followupAvailable &&
    !work.followup &&
    (work.decision?.path === "hold" || work.decision?.path === "revise"),
  );

  function postCommand(
    command: WorkspaceCommand,
    buttonLabel: string,
    disabled = false,
  ) {
    return (
      <fetcher.Form
        method="post"
        action="/"
        className="inline-flex"
        onSubmit={() => {
          submittedCommandType.current = command.type;
        }}
      >
        <input type="hidden" name="command" value={JSON.stringify(command)} />
        <input
          type="hidden"
          name="expectedRevision"
          value={workspace.revision}
        />
        <Button
          type="submit"
          color="secondary"
          disabled={disabled || fetcher.state !== "idle"}
        >
          {buttonLabel}
        </Button>
      </fetcher.Form>
    );
  }

  if (!knownStage) {
    return (
      <main className="mx-auto w-full max-w-4xl px-5 py-6 text-default sm:px-8">
        <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
          Stage not found
        </h1>
        <p className="mt-3 text-secondary">
          Choose one of the listed stages to continue this engagement.
        </p>
        <TextLink
          as={Link}
          className="mt-4 inline-block"
          to={engagementPath(engagement.id, "overview")}
        >
          Return to {clientLabel}
        </TextLink>
      </main>
    );
  }

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
            <li>
              <span>Work</span>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{stage.name}</li>
          </ol>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-secondary">
              Stage {stageIndex + 1} of {stages.length}
            </p>
            <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
              {stage.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-secondary">
              {stage.title}
            </p>
            <TextLink
              as={Link}
              className="mt-3 inline-block text-sm"
              to={engagementPath(engagement.id, `context?stage=${stageIndex}`)}
            >
              Open stage context
            </TextLink>
          </div>
          <div className="min-w-52 text-sm">
            <label className="mb-1 block" htmlFor={stagePickerId}>
              Go to a stage
            </label>
            <Select
              id={stagePickerId}
              options={stages.map((item, index) => ({
                value: item.id,
                label: `${index + 1}. ${item.name}`,
              }))}
              value={stage.id}
              onChange={(option) =>
                navigate(engagementPath(engagement.id, `work/${option.value}`))
              }
            />
          </div>
        </div>
      </header>

      {blocker.state === "blocked" && (
        <section
          aria-label="Unsaved changes"
          role="alertdialog"
          className="mb-6 border-l-4 border-warning-outline py-2 pl-4"
        >
          <p className="font-medium">You have changes that are not saved.</p>
          <p className="mt-1 text-sm text-secondary">
            Leave this stage and discard them?
          </p>
          <div className="mt-3 flex gap-3">
            <Button
              type="button"
              color="danger"
              onClick={() => blocker.proceed?.()}
            >
              Leave this page
            </Button>
            <Button
              type="button"
              color="secondary"
              onClick={() => blocker.reset?.()}
            >
              Keep editing
            </Button>
          </div>
        </section>
      )}

      {fetcher.data?.error && (
        <p role="alert" className="mb-5 text-sm text-warning">
          {fetcher.data.error}
        </p>
      )}
      {fetcher.data?.notice && (
        <p role="status" className="mb-5 text-sm">
          {fetcher.data.notice}
        </p>
      )}

      {isFutureStage && (
        <p className="mb-6 border-l-4 border-default py-2 pl-4 text-sm text-secondary">
          This stage is a preview. Complete the earlier stage decisions before
          adding records or recording a decision here.
        </p>
      )}

      <section
        aria-labelledby="work-heading"
        className="border-t border-default py-5"
      >
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="work-heading" className="text-base font-semibold">
              Your work
            </h2>
            <p className="mt-1 max-w-2xl text-secondary">
              {stage.you.join(" ")}
            </p>
          </div>
          <details className="max-w-md text-sm">
            <summary className="cursor-pointer underline underline-offset-2">
              What the assistant prepares
            </summary>
            <p className="mt-2 text-secondary">{stage.copilot}</p>
          </details>
        </div>

        {work.questions.length > 0 && (
          <section aria-labelledby="questions-heading" className="mb-6">
            <h3 id="questions-heading" className="mb-3 text-sm font-medium">
              Questions for the client
            </h3>
            {work.questions.some((question) => question.answer) && (
              <details className="mb-4 border-y border-default py-3">
                <summary className="cursor-pointer font-medium">
                  Answered questions
                </summary>
                <ul className="mt-3 space-y-4">
                  {work.questions
                    .filter((question) => question.answer)
                    .map((question) => (
                      <li key={question.question}>
                        <p className="font-medium">{question.question}</p>
                        <p className="mt-1 text-secondary">
                          {question.answer!.text}
                        </p>
                        <SourceReferences
                          engagementId={engagement.id}
                          references={question.answer!.refs}
                          returnTo={{
                            path: stagePath,
                            label: stage.name.toLowerCase(),
                          }}
                        />
                      </li>
                    ))}
                </ul>
              </details>
            )}
            <ul className="space-y-4">
              {work.questions
                .filter((question) => !question.answer)
                .map((question) => (
                  <li
                    key={question.question}
                    className="border-l-2 border-default pl-4"
                  >
                    <p className="text-xs text-secondary">
                      {question.who} · {question.when}
                    </p>
                    <p className="mt-1 font-medium">{question.question}</p>
                    <p className="mt-1 text-sm text-secondary">
                      {question.why}
                    </p>
                    <div className="mt-2">
                      <SourceReferences
                        engagementId={engagement.id}
                        references={question.refs}
                        returnTo={{
                          path: stagePath,
                          label: stage.name.toLowerCase(),
                        }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {!work.loaded && canAct && stageIndex === 0 && engagement.example && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {postCommand(
              { type: "load-client-files", engagementId: engagement.id },
              "Load client files",
            )}
            <span className="text-sm text-secondary">
              The brief will be prepared from the sample material.
            </span>
          </div>
        )}

        {!work.loaded && canAct && engagement.example && stageIndex > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {postCommand(loadCommand!, "Load stage records")}
            <span className="text-sm text-secondary">
              Records prepare a working draft for this stage.
            </span>
          </div>
        )}

        {!work.loaded && canAct && !engagement.example && (
          <p className="mb-6 text-sm text-secondary">
            Add a source record in{" "}
            <TextLink
              as={Link}
              to={engagementPath(engagement.id, `context?stage=${stageIndex}`)}
            >
              stage context
            </TextLink>{" "}
            before reviewing the brief.
          </p>
        )}

        {work.loaded && stageSources.length > 0 && (
          <details className="mb-6 border-y border-default py-3">
            <summary className="cursor-pointer font-medium">
              Sources for this stage{" "}
              <span className="font-normal text-secondary">
                ({stageSources.length})
              </span>
            </summary>
            <p className="mb-2 mt-3 text-sm text-secondary">
              Sources provide context. Review the brief and record a stage
              decision separately.
            </p>
            <SourceLinkList
              engagementId={engagement.id}
              sources={stageSources}
              returnTo={{ path: stagePath, label: stage.name.toLowerCase() }}
            />
          </details>
        )}

        {work.suggestion && (
          <section
            aria-labelledby="proposed-update"
            className="mb-6 border-l-4 border-info-outline py-1 pl-4"
          >
            <h3 id="proposed-update" className="text-sm font-medium">
              Update from a client conversation
            </h3>
            <p className="mt-1 text-sm text-secondary">
              This is a proposed change. The current brief stays in place until
              you choose to use it.
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm">
              {work.suggestion.text}
            </p>
            <div className="mt-2">
              <SourceReferences
                engagementId={engagement.id}
                references={[
                  {
                    id: work.suggestion.sourceId,
                    label: `Source ${work.suggestion.sourceId}`,
                  },
                ]}
                returnTo={{ path: stagePath, label: stage.name.toLowerCase() }}
              />
            </div>
            {canAct && (
              <div className="mt-4 flex flex-wrap gap-3">
                {postCommand(
                  {
                    type: "use-update",
                    engagementId: engagement.id,
                    stageIndex,
                  },
                  "Use update",
                  changedSinceSaved,
                )}
                {postCommand(
                  {
                    type: "keep-brief",
                    engagementId: engagement.id,
                    stageIndex,
                  },
                  "Keep current brief",
                )}
                {changedSinceSaved && (
                  <p className="basis-full text-sm text-secondary">
                    Keep the current brief to resolve this proposal without
                    losing your local edits.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">{stage.document}</h3>
            <p className="mt-1 text-sm text-secondary">
              {changedSinceSaved
                ? "This brief has changed since review. Save it again after resolving any proposed update."
                : work.reviewed
                  ? "Brief review saved."
                  : "Review the supported details, gaps and next action."}
            </p>
          </div>
          {work.reviewed && !changedSinceSaved && (
            <Badge color="secondary">Review saved</Badge>
          )}
        </div>
        <fetcher.Form
          method="post"
          action="/"
          className="space-y-3"
          onSubmit={() => {
            submittedCommandType.current = "save-brief";
          }}
        >
          <input
            type="hidden"
            name="command"
            value={JSON.stringify({
              type: "save-brief",
              engagementId: engagement.id,
              stageIndex,
              text: briefText,
            } satisfies WorkspaceCommand)}
          />
          <input
            type="hidden"
            name="expectedRevision"
            value={workspace.revision}
          />
          <Textarea
            aria-label={`${stage.document} content`}
            value={briefText}
            onChange={(event) => setBriefText(event.target.value)}
            rows={12}
            disabled={!canEditBrief}
            className="w-full"
          />
          {citedSources.length > 0 && (
            <div className="text-sm">
              <span className="mr-2 text-secondary">
                Sources cited in this brief:
              </span>
              <SourceLinkList
                engagementId={engagement.id}
                sources={citedSources}
                returnTo={{ path: stagePath, label: stage.name.toLowerCase() }}
              />
            </div>
          )}
          {canEditBrief && (
            <Button
              type="submit"
              color="primary"
              disabled={
                fetcher.state !== "idle" ||
                !briefText.trim() ||
                Boolean(work.suggestion)
              }
            >
              Save brief review
            </Button>
          )}
        </fetcher.Form>
      </section>

      <section
        aria-labelledby="stage-checks"
        className="border-t border-default py-5"
      >
        <h2 id="stage-checks" className="text-base font-semibold">
          Before the stage decision
        </h2>
        <p className="mt-1 max-w-2xl text-secondary">{stage.exit}</p>
        <ul className="mt-5 space-y-4">
          {gate.checks.map((check) => (
            <li
              key={check.key}
              className="flex flex-col items-start gap-2 border-b border-default pb-4 sm:flex-row sm:justify-between"
            >
              <div>
                <p className="font-medium">{check.label}</p>
                {check.source && (
                  <SourceLinkList
                    engagementId={engagement.id}
                    sources={[check.source]}
                    returnTo={{
                      path: stagePath,
                      label: stage.name.toLowerCase(),
                    }}
                  />
                )}
              </div>
              <EvidenceStatus
                result={check.result}
                reviewed={work.reviewed && !changedSinceSaved}
              />
            </li>
          ))}
        </ul>
        {gate.missing.length > 0 && (
          <div className="mt-5">
            <h3 className="font-medium">Open items</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
              {gate.missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {gate.authority && (
          <div className="mt-6 border-t border-default pt-4">
            <h3 className="font-medium">Authority record</h3>
            <p className="mt-1 text-sm text-secondary">
              {gate.authority.decisionBy ?? gate.authority.by}
              {gate.authority.decisionSummary
                ? ` · ${gate.authority.decisionSummary}`
                : ""}
            </p>
            <div className="mt-2">
              <SourceLinkList
                engagementId={engagement.id}
                sources={[gate.authority]}
                returnTo={{ path: stagePath, label: stage.name.toLowerCase() }}
              />
            </div>
          </div>
        )}
      </section>

      {canLoadFollowup && canAct && (
        <section
          aria-labelledby="followup-title"
          className="border-t border-default py-5"
        >
          <h2 id="followup-title" className="text-base font-semibold">
            Follow-up evidence
          </h2>
          <p className="mt-1 text-secondary">
            Add the next evidence set, then review the new draft before changing
            the decision.
          </p>
          {stageIndex === 0
            ? postCommand(
                { type: "load-call", engagementId: engagement.id },
                "Load sample follow-up conversation",
              )
            : postCommand(
                {
                  type: "load-records",
                  engagementId: engagement.id,
                  stageIndex,
                  followup: true,
                },
                "Load follow-up records",
                changedSinceSaved,
              )}
          {changedSinceSaved && (
            <p className="mt-2 text-sm text-secondary">
              Save the brief changes before adding follow-up records.
            </p>
          )}
        </section>
      )}

      <section
        aria-labelledby="decision-title"
        className="border-t border-default py-5"
      >
        <h2 id="decision-title" className="text-base font-semibold">
          Record the stage decision
        </h2>
        <p className="mt-1 text-secondary">
          The decision belongs to {stage.authority}. Recording it here does not
          change what the sources say.
        </p>
        {work.decision && (
          <p className="mt-3 flex items-center gap-2 text-sm">
            <span>Recorded decision:</span>
            <DecisionStatus decision={work.decision} />
            <span>· {work.decision.reason}</span>
          </p>
        )}
        {work.decision?.path === "advance" && work.decision.valid ? (
          <div className="mt-5">
            <ButtonLink
              as={Link}
              to={engagementPath(
                engagement.id,
                stageIndex < stages.length - 1
                  ? `work/${stages[stageIndex + 1].id}`
                  : "delivery",
              )}
              color="primary"
            >
              {stageIndex < stages.length - 1
                ? `Continue to ${stages[stageIndex + 1].name.toLowerCase()}`
                : "Review the closure record"}
            </ButtonLink>
          </div>
        ) : canAct ? (
          <fetcher.Form
            method="post"
            action="/"
            className="mt-5 max-w-2xl space-y-4"
            onSubmit={() => {
              submittedCommandType.current = "decide";
            }}
          >
            <input
              type="hidden"
              name="command"
              value={JSON.stringify({
                type: "decide",
                engagementId: engagement.id,
                stageIndex,
                path: decisionPath,
                reason: decisionReason,
              } satisfies WorkspaceCommand)}
            />
            <input
              type="hidden"
              name="expectedRevision"
              value={workspace.revision}
            />
            <div className="text-sm">
              <label className="mb-1 block" htmlFor={decisionPickerId}>
                Decision
              </label>
              <Select
                id={decisionPickerId}
                options={decisionPaths}
                value={decisionPath}
                onChange={(option) => setDecisionPath(option.value)}
              />
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span>Reason and next action</span>
              <Textarea
                value={decisionReason}
                onChange={(event) => setDecisionReason(event.target.value)}
                rows={3}
                required
              />
            </label>
            {decisionPath === "advance" &&
              (!gate.ready ||
                !work.reviewed ||
                changedSinceSaved ||
                Boolean(work.suggestion)) && (
                <p className="text-sm text-warning">
                  Resolve the open items and save the current brief before
                  proceeding.
                </p>
              )}
            <Button
              type="submit"
              color="primary"
              disabled={
                fetcher.state !== "idle" ||
                !decisionReason.trim() ||
                (decisionPath === "advance" &&
                  (!gate.ready ||
                    !work.reviewed ||
                    changedSinceSaved ||
                    Boolean(work.suggestion)))
              }
            >
              Record decision
            </Button>
          </fetcher.Form>
        ) : (
          <p className="mt-4 text-sm text-secondary">
            Complete earlier stage decisions before recording this one.
          </p>
        )}
      </section>
    </main>
  );
}
