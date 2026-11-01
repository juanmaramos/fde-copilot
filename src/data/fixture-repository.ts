import { stages } from "../domain/stages";
import {
  clientIntake,
  clientCall,
  folderSources,
  folderPreviews,
  stagePackages,
} from "../fixtures/harbor";
import {
  citedSourceIds,
  getCurrentStage,
  getGate,
  reopenDecisions,
} from "../domain/workflow";
import type {
  ClientQuestion,
  Engagement,
  EngagementRepository,
  Source,
  SourceSeed,
  Workspace,
  WorkspaceCommand,
} from "../domain/types";

// This adapter is for UI development only. Real permissions and persistence belong to the future server.
const STORAGE_KEY = "engagement-workspace-example-v1";
const clone = <T>(value: T): T => structuredClone(value);

function newEngagement(
  id: string,
  client: string,
  problem: string,
  operator: string,
  constraint: string,
  example: boolean,
): Engagement {
  return {
    id,
    client,
    problem,
    operator,
    constraint,
    example,
    sources: [],
    events: [],
    steps: stages.map((_, stageIndex) => ({
      loaded: false,
      followup: false,
      followupAvailable: example && !!stagePackages[stageIndex].followup,
      questions: [],
      text: "",
      savedText: "",
      reviewed: false,
    })),
  };
}

export function createInitialWorkspace(): Workspace {
  return {
    revision: 0,
    engagements: [
      newEngagement(
        "harbor",
        "Harbor Studio",
        "Incoming project requests sit in a queue while coordinators work out who should handle them. Can AI route them next month?",
        "Alex Chen · Production coordinator",
        "Keep the existing project system and commercial approval with people.",
        true,
      ),
    ],
  };
}

function sourceFrom(seed: SourceSeed, stageIndex: number): Source {
  return {
    ...clone(seed),
    covers: { ...seed.covers },
    stageIndex,
    revision: 1,
    available: !!(seed.body || seed.sections?.length || seed.sheet),
  };
}

function requireExample(engagement: Engagement): void {
  if (!engagement.example)
    throw new Error(
      "Prepared examples belong to the Harbor Studio walkthrough.",
    );
}

function questionsAfterCall(
  questions: ClientQuestion[],
  sourceId: string,
): ClientQuestion[] {
  const answers = [
    {
      text: "A representative de-identified export and read-only test access were approved. Production access remains excluded.",
      refs: [{ id: sourceId, anchor: "00:42 · Leila" }],
    },
    {
      text: "The sponsor authorizes discovery. Launch scope and date still need agreement.",
      refs: [{ id: sourceId, anchor: "02:10 · Maya" }],
    },
  ];
  return questions.map((question, index) =>
    answers[index] ? { ...question, answer: answers[index] } : question,
  );
}

export function applyCommand(
  previous: Workspace,
  command: WorkspaceCommand,
): Workspace {
  const workspace = clone(previous);
  if (command.type === "create") {
    if (
      !command.client.trim() ||
      !command.problem.trim() ||
      !command.operator.trim()
    )
      throw new Error("Add the client, problem and person doing the work.");
    workspace.engagements.push(
      newEngagement(
        crypto.randomUUID(),
        command.client.trim(),
        command.problem.trim(),
        command.operator.trim(),
        command.constraint.trim(),
        false,
      ),
    );
    workspace.revision++;
    return workspace;
  }
  const engagement = workspace.engagements.find(
    (item) => item.id === command.engagementId,
  );
  if (!engagement) throw new Error("This engagement is no longer available.");
  const stageIndex = "stageIndex" in command ? command.stageIndex : 0;
  const step = engagement.steps[stageIndex];
  if (!step || !Number.isInteger(stageIndex))
    throw new Error("Choose an existing stage.");
  if (stageIndex > getCurrentStage(engagement))
    throw new Error("Complete the preceding stage before changing this one.");
  const append = (records: SourceSeed[]) =>
    records.forEach((seed) => {
      if (!engagement.sources.some((source) => source.id === seed.id))
        engagement.sources.push(sourceFrom(seed, stageIndex));
    });
  switch (command.type) {
    case "load-client-files":
      requireExample(engagement);
      if (step.loaded)
        throw new Error("These client files are already included.");
      append(clientIntake.records);
      step.loaded = true;
      step.text = clientIntake.draft;
      step.questions = clone(clientIntake.questions);
      break;
    case "load-folder":
      requireExample(engagement);
      append(
        folderSources.map((seed) => ({ ...seed, ...folderPreviews[seed.id] })),
      );
      break;
    case "load-records": {
      requireExample(engagement);
      if (stageIndex === 0)
        throw new Error("Use the sample client files to begin qualification.");
      const pack = stagePackages[stageIndex];
      if (command.followup) {
        const decisionCoversInitialEvidence = pack.records.every((record) => {
          const source = engagement.sources.find(
            (item) => item.id === record.id,
          );
          return (
            source &&
            step.decision?.sourceVersions[record.id] === source.revision
          );
        });
        if (
          !step.loaded ||
          !pack.followup ||
          step.followup ||
          !["hold", "revise"].includes(step.decision?.path ?? "") ||
          !decisionCoversInitialEvidence
        )
          throw new Error(
            "Load the initial evidence, then record a hold or revision before adding follow-up results.",
          );
        append(pack.followup);
        step.followup = true;
        step.suggestion = {
          sourceId: pack.followup[0].id,
          text: pack.draft,
          findings: [],
        };
      } else {
        if (step.loaded) throw new Error("These records are already included.");
        append(pack.records);
        step.loaded = true;
        step.text =
          stageIndex === 4
            ? "Candidate r0.1: 87/90 appropriate recommendations on a held-out assessment. [E09]\nCritical failure: one assignment bypassed coordinator confirmation. Average quality does not satisfy the permission boundary. [E09]\nRecommendation: hold, enforce confirmation in the application and reassess fresh cases. [E10]"
            : stageIndex === 8
              ? "Normal and exception work passed. Receiver-led timeout recovery required help from the delivery engineer. [E20]\nIndependent recovery and support acknowledgement remain incomplete. [E20]\nRecommendation: hold transfer, clarify the recovery instructions and repeat the exercise. [E21]"
              : pack.draft;
      }
      step.reviewed = false;
      reopenDecisions(engagement, stageIndex, "New evidence was added.");
      break;
    }
    case "load-call": {
      requireExample(engagement);
      if (!step.loaded) throw new Error("Add the initial client files first.");
      if (
        engagement.sources.some(
          (source) => source.filename === "discovery-call.txt",
        )
      )
        throw new Error("The follow-up conversation is already included.");
      const id = `N${String(engagement.sources.filter((source) => source.id.startsWith("N")).length + 1).padStart(2, "0")}`;
      append([
        {
          id,
          title: clientCall.title,
          kind: "Transcript",
          by: clientCall.by,
          body: clientCall.body,
          sections: clientCall.sections,
          findings: clientCall.findings,
          date: clientCall.date,
          version: "Follow-up call",
          filename: "discovery-call.txt",
          folder: "Client conversations",
          summary:
            "Discovery access and permission to start, with explicit limits.",
          covers: { access: "pass" },
          decision: "advance",
          decisionBy: "Maya Ortiz · Client sponsor",
          example: true,
        },
      ]);
      const text = step.text
        .split("\n\n")
        .map((paragraph) =>
          paragraph.startsWith("Access:")
            ? `Access: the data owner approves a representative de-identified export and read-only test access for discovery. Production access is excluded. [${id}, 00:42 · Leila]`
            : paragraph.startsWith("Recommendation:")
              ? `Recommendation: proceed to discovery under the agreed limits. Maya authorizes the start; launch scope and date still need agreement. [${id}, 02:10 · Maya]`
              : paragraph,
        )
        .join("\n\n");
      step.suggestion = {
        sourceId: id,
        text,
        findings: clone(clientCall.findings),
      };
      if (!text.includes(`[${id}`))
        step.suggestion.text += `\n\nClient follow-up: discovery access is approved within the recorded limits, and Maya authorizes discovery. Production access and launch scope remain separate. [${id}, 00:42 · Leila; 02:10 · Maya]`;
      step.followup = true;
      step.reviewed = false;
      step.questions = questionsAfterCall(step.questions, id);
      reopenDecisions(engagement, 0, "New client context was added.");
      break;
    }
    case "add-context": {
      if (!command.body.trim())
        throw new Error("Paste the source content first.");
      const id = `N${String(engagement.sources.filter((source) => source.id.startsWith("N")).length + 1).padStart(2, "0")}`;
      append([
        {
          id,
          title:
            command.title?.trim() ||
            `Context for ${stages[stageIndex].name.toLowerCase()}`,
          kind: "Notes",
          body: command.body.trim(),
          covers: {},
          folder: "Added context",
        },
      ]);
      step.reviewed = false;
      reopenDecisions(
        engagement,
        stageIndex,
        "New context may change the current interpretation.",
      );
      break;
    }
    case "use-update":
      if (!step.suggestion)
        throw new Error("There is no proposed update to apply.");
      step.text = step.suggestion.text;
      step.reviewed = false;
      delete step.suggestion;
      reopenDecisions(engagement, stageIndex, "The brief changed.");
      break;
    case "keep-brief":
      delete step.suggestion;
      step.reviewed = false;
      break;
    case "save-brief":
      if (!command.text.trim())
        throw new Error("Add the brief before saving your review.");
      if (step.suggestion)
        throw new Error(
          "Use the proposed update or keep the current brief before saving.",
        );
      for (const id of citedSourceIds(command.text))
        if (!engagement.sources.some((source) => source.id === id))
          throw new Error(
            `The brief cites ${id}, which is not in this engagement.`,
          );
      if (command.text !== step.savedText)
        reopenDecisions(engagement, stageIndex, "The reviewed brief changed.");
      step.text = command.text;
      step.savedText = command.text;
      step.reviewed = true;
      break;
    case "decide": {
      if (!command.reason.trim())
        throw new Error("Add the reason and next step.");
      const gate = getGate(engagement, stageIndex);
      if (command.path === "advance" && !gate.ready)
        throw new Error(`Before proceeding: ${gate.missing.join(" ")}`);
      step.decision = {
        path: command.path,
        reason: command.reason.trim(),
        authority:
          command.path === "advance"
            ? gate.authorityName
            : "You · Delivery lead",
        sourceId: command.path === "advance" ? gate.authority!.id : undefined,
        sourceVersions: Object.fromEntries(
          engagement.sources
            .filter((source) => source.stageIndex === stageIndex)
            .map((source) => [source.id, source.revision]),
        ),
        valid: true,
      };
      engagement.events.push({
        stageIndex,
        type: {
          advance: "Proceed",
          hold: "Wait",
          revise: "Revise",
          stop: "Stop",
        }[command.path],
        reason: command.reason.trim(),
      });
      if (command.path !== "advance")
        reopenDecisions(engagement, stageIndex, "The stage decision changed.");
      break;
    }
  }
  workspace.revision++;
  return workspace;
}

export function createFixtureRepository(
  storage?: Pick<Storage, "getItem" | "setItem">,
): EngagementRepository {
  let current = createInitialWorkspace();
  let restoreError: Error | undefined;
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (saved) {
      const candidate = JSON.parse(saved) as Workspace;
      if (
        !Number.isInteger(candidate.revision) ||
        !candidate.engagements?.length ||
        !candidate.engagements.every(
          (item) =>
            Array.isArray(item.sources) && item.steps?.length === stages.length,
        )
      )
        throw new Error("Unsupported saved workspace.");
      // Decisions created by an earlier frontend have no version binding and must be reviewed again.
      candidate.engagements.forEach((item) =>
        item.steps.forEach((step, index) => {
          step.followupAvailable ??=
            item.example && !!stagePackages[index].followup;
          if (!step.questions) {
            step.questions =
              item.example && index === 0 && step.loaded
                ? clone(clientIntake.questions)
                : [];
            const call = item.sources.find(
              (source) => source.filename === "discovery-call.txt",
            );
            if (index === 0 && call)
              step.questions = questionsAfterCall(step.questions, call.id);
          }
          if (step.decision && !step.decision.sourceVersions) {
            step.decision.sourceVersions = {};
            step.decision.valid = false;
          }
        }),
      );
      // Normalize source records restored from earlier previews.
      candidate.engagements.forEach((item) =>
        item.sources.forEach((source) => {
          // Older example inventories used display strings for missing metadata.
          if (source.example) {
            if (source.by === "Author not recorded") delete source.by;
            if (source.date === "Date not recorded") delete source.date;
            if (source.version === "Inventory entry") delete source.version;
          }
          if (
            source.kind === "Notes" &&
            source.folder === "Added context" &&
            source.by === "Provided in this workspace"
          )
            delete source.by;
          if (
            source.example &&
            source.id === "S02" &&
            source.body === clientIntake.records[1].body &&
            source.covers.access === "fail"
          )
            source.covers.access = "pending";
        }),
      );
      current = candidate;
    }
  } catch {
    restoreError = new Error(
      "Saved workspace data could not be opened. It has been preserved for recovery.",
    );
  }
  return {
    async read() {
      if (restoreError) throw restoreError;
      return clone(current);
    },
    async execute(command, expectedRevision) {
      if (restoreError) throw restoreError;
      if (expectedRevision !== current.revision)
        throw new Error(
          "The engagement changed. Refresh the page and review the latest version before trying again.",
        );
      const next = applyCommand(current, command);
      // Persist first: a failed write must not appear as a successful save in the UI.
      storage?.setItem(STORAGE_KEY, JSON.stringify(next));
      current = next;
      return clone(current);
    },
  };
}
