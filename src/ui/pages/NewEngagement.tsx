import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Input } from "@openai/apps-sdk-ui/components/Input";
import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { useEffect, useState } from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import type { WorkspaceCommand } from "../../domain/types";
import { useWorkspace } from "../../data/context";

export function NewEngagementPage() {
  const { workspace } = useWorkspace();
  const fetcher = useFetcher<{
    error?: string;
    notice?: string;
    createdEngagementId?: string;
  }>();
  const navigate = useNavigate();
  const [client, setClient] = useState("");
  const [problem, setProblem] = useState("");
  const [operator, setOperator] = useState("");
  const [constraint, setConstraint] = useState("");

  useEffect(() => {
    if (fetcher.data?.createdEngagementId) {
      navigate(
        `/engagements/${encodeURIComponent(fetcher.data.createdEngagementId)}/overview`,
      );
    }
  }, [fetcher.data?.createdEngagementId, navigate]);

  const command: WorkspaceCommand = {
    type: "create",
    client: client.trim(),
    problem: problem.trim(),
    operator: operator.trim(),
    constraint: constraint.trim(),
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-6 text-default sm:px-8">
      <header className="mb-6">
        <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
          New engagement
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-secondary">
          Start with the request and the people who do the work. You can add
          supporting context after creating the engagement.
        </p>
      </header>

      {fetcher.data?.error && (
        <p role="alert" className="mb-5 text-sm text-warning">
          {fetcher.data.error}
        </p>
      )}

      <fetcher.Form method="post" action="/" className="space-y-5">
        <input type="hidden" name="command" value={JSON.stringify(command)} />
        <input
          type="hidden"
          name="expectedRevision"
          value={workspace.revision}
        />
        <label className="flex max-w-xl flex-col gap-1 text-sm">
          <span>Client or team</span>
          <Input
            value={client}
            onChange={(event) => setClient(event.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>What needs to improve?</span>
          <Textarea
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            rows={5}
            required
          />
        </label>
        <label className="flex max-w-xl flex-col gap-1 text-sm">
          <span>Who does the work today?</span>
          <Input
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            maxLength={160}
            required
          />
        </label>
        <label className="flex max-w-xl flex-col gap-1 text-sm">
          <span>
            Deadline or constraint{" "}
            <span className="text-secondary">(optional)</span>
          </span>
          <Input
            value={constraint}
            onChange={(event) => setConstraint(event.target.value)}
            maxLength={240}
          />
        </label>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            type="submit"
            color="primary"
            disabled={
              fetcher.state !== "idle" ||
              !client.trim() ||
              !problem.trim() ||
              !operator.trim()
            }
          >
            Create engagement
          </Button>
          <TextLink as={Link} className="text-sm" to="/">
            Cancel
          </TextLink>
        </div>
      </fetcher.Form>
    </main>
  );
}
