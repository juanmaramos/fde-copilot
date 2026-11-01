import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Input } from "@openai/apps-sdk-ui/components/Input";
import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { stages } from "../../domain/stages";
import { getCurrentStage } from "../../domain/workflow";
import type { WorkspaceCommand } from "../../domain/types";
import { useEngagement } from "../../data/context";
import { SourceReferences } from "../components/SourceReferences";

const engagementPath = (engagementId: string, suffix: string) =>
  `/engagements/${encodeURIComponent(engagementId)}/${suffix}`;

export function ContextPage() {
  const { engagement, workspace, clientLabel } = useEngagement();
  const [searchParams] = useSearchParams();
  const currentStage = getCurrentStage(engagement);
  const queryStage = Number(searchParams.get("stage"));
  const stageIndex =
    Number.isInteger(queryStage) &&
    queryStage >= 0 &&
    queryStage < stages.length
      ? queryStage
      : Math.min(currentStage, stages.length - 1);
  const stage = stages[stageIndex]!;
  const stageSources = engagement.sources.filter(
    (source) => source.stageIndex === stageIndex,
  );
  const fetcher = useFetcher<{ error?: string; notice?: string }>();
  const titleInputId = useId();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const canAddContext =
    stageIndex <= currentStage && currentStage < stages.length;
  const contextPath = useMemo(
    () => engagementPath(engagement.id, `context?stage=${stageIndex}`),
    [engagement.id, stageIndex],
  );
  const qualificationLoaded = engagement.steps[0]?.loaded ?? false;
  const hasFollowupConversation = engagement.steps[0]?.followup ?? false;

  useEffect(() => {
    if (fetcher.data?.notice && !fetcher.data.error) {
      setTitle("");
      setBody("");
    }
  }, [fetcher.data]);

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
            <li aria-current="page">Context</li>
          </ol>
        </nav>
        <p className="mb-2 text-sm text-secondary">
          Stage {stageIndex + 1} · {stage.name}
        </p>
        <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
          Context
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-secondary">
          Add relevant notes or a conversation record. Context is linked to its
          stage; it does not approve a decision by itself.
        </p>
      </header>

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

      {engagement.example &&
        stageIndex === 0 &&
        qualificationLoaded &&
        !hasFollowupConversation &&
        canAddContext && (
          <section
            aria-labelledby="sample-call-heading"
            className="mb-6 border-y border-default py-5"
          >
            <h2 id="sample-call-heading" className="text-base font-semibold">
              Continue the qualification example
            </h2>
            <p className="mt-2 max-w-2xl text-secondary">
              Load the sample follow-up conversation about access and permission
              to start. Its proposed brief update will remain separate until you
              choose to use it.
            </p>
            <fetcher.Form method="post" action="/" className="mt-4">
              <input
                type="hidden"
                name="command"
                value={JSON.stringify({
                  type: "load-call",
                  engagementId: engagement.id,
                } satisfies WorkspaceCommand)}
              />
              <input
                type="hidden"
                name="expectedRevision"
                value={workspace.revision}
              />
              <Button
                type="submit"
                color="secondary"
                disabled={fetcher.state !== "idle"}
              >
                Load sample follow-up conversation
              </Button>
            </fetcher.Form>
          </section>
        )}

      <section
        aria-labelledby="add-context-heading"
        className="border-b border-default pb-8"
      >
        <h2 id="add-context-heading" className="text-base font-semibold">
          Add context for {stage.name.toLowerCase()}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-secondary">
          Paste the relevant excerpt or notes below. A title is optional. This
          adds a source record for the stage without changing its brief or
          decision.
        </p>
        <fetcher.Form
          method="post"
          action="/"
          className="mt-5 max-w-2xl space-y-4"
        >
          <input
            type="hidden"
            name="command"
            value={JSON.stringify({
              type: "add-context",
              engagementId: engagement.id,
              stageIndex,
              body,
              ...(title.trim() ? { title: title.trim() } : {}),
            } satisfies WorkspaceCommand)}
          />
          <input
            type="hidden"
            name="expectedRevision"
            value={workspace.revision}
          />
          <label className="flex flex-col gap-1 text-sm" htmlFor={titleInputId}>
            <span>
              Title <span className="text-secondary">(optional)</span>
            </span>
            <Input
              id={titleInputId}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Source text or notes</span>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={8}
              required
              disabled={!canAddContext}
            />
          </label>
          {!canAddContext && (
            <p className="text-sm text-secondary">
              Complete earlier stage decisions before adding context here.
            </p>
          )}
          <Button
            type="submit"
            color="secondary"
            disabled={
              !canAddContext || !body.trim() || fetcher.state !== "idle"
            }
          >
            Add context
          </Button>
        </fetcher.Form>
      </section>

      <section aria-labelledby="sources-heading" className="py-5">
        <h2 id="sources-heading" className="text-base font-semibold">
          Sources for {stage.name.toLowerCase()}
        </h2>
        {stageSources.length > 0 ? (
          <ul className="mt-4 divide-y divide-[var(--color-border)]">
            {stageSources.map((source) => (
              <li key={source.id} className="py-4">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-medium">{source.title}</span>
                  <span className="text-sm text-secondary">
                    {source.id} · {source.kind}
                  </span>
                </div>
                <p className="mt-1 text-sm text-secondary">
                  {source.summary ?? source.by}
                </p>
                {source.processing && (
                  <p className="mt-1 text-sm text-secondary">
                    {source.processing === "ready"
                      ? "Content available"
                      : "Inventory entry; content has not been read"}
                  </p>
                )}
                <div className="mt-2">
                  <SourceReferences
                    engagementId={engagement.id}
                    references={[{ id: source.id, label: `Open ${source.id}` }]}
                    returnTo={{ path: contextPath, label: "context" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-secondary">
            No context has been added for this stage.
          </p>
        )}
      </section>
    </main>
  );
}
