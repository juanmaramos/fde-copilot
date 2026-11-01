import { describe, expect, it } from "vitest";
import {
  applyCommand,
  createFixtureRepository,
  createInitialWorkspace,
} from "../data/fixture-repository";
import { getCurrentStage, getGate } from "./workflow";
import type { Workspace } from "./types";

function qualify(): Workspace {
  let workspace = applyCommand(createInitialWorkspace(), {
    type: "load-client-files",
    engagementId: "harbor",
  });
  workspace = applyCommand(workspace, {
    type: "load-call",
    engagementId: "harbor",
  });
  workspace = applyCommand(workspace, {
    type: "use-update",
    engagementId: "harbor",
    stageIndex: 0,
  });
  return saveAndAdvance(workspace, 0);
}

function saveAndAdvance(workspace: Workspace, stageIndex: number): Workspace {
  workspace = applyCommand(workspace, {
    type: "save-brief",
    engagementId: "harbor",
    stageIndex,
    text: workspace.engagements[0].steps[stageIndex].text,
  });
  return applyCommand(workspace, {
    type: "decide",
    engagementId: "harbor",
    stageIndex,
    path: "advance",
    reason: "The scoped evidence and authority support this next step.",
  });
}

function reachExperiment(): Workspace {
  let workspace = qualify();
  for (const stageIndex of [1, 2, 3]) {
    workspace = applyCommand(workspace, {
      type: "load-records",
      engagementId: "harbor",
      stageIndex,
    });
    workspace = saveAndAdvance(workspace, stageIndex);
  }
  return applyCommand(workspace, {
    type: "load-records",
    engagementId: "harbor",
    stageIndex: 4,
  });
}

describe("evidence and stage decisions", () => {
  it("requires a named authority when an approval record has no attribution", () => {
    const workspace = qualify();
    const engagement = workspace.engagements[0];
    const permission = engagement.sources.find(
      (source) => source.stageIndex === 0 && source.decision === "advance",
    )!;
    delete permission.by;
    delete permission.decisionBy;
    expect(getGate(engagement, 0).ready).toBe(false);
    expect(() =>
      applyCommand(workspace, {
        type: "decide",
        engagementId: "harbor",
        stageIndex: 0,
        path: "advance",
        reason: "The record says proceed, but the decision maker is unknown.",
      }),
    ).toThrow("Name the person");
  });

  it("uses provided files as context without requiring per-file review, while access stays pending", () => {
    let workspace = applyCommand(createInitialWorkspace(), {
      type: "load-client-files",
      engagementId: "harbor",
    });
    const engagement = workspace.engagements[0];
    expect(engagement.sources).toHaveLength(4);
    expect(
      engagement.sources.every(
        (source) => source.available && !("reviewed" in source),
      ),
    ).toBe(true);
    expect(engagement.steps[0].text).toContain("[S01");
    expect(getGate(engagement, 0).checks.map((check) => check.result)).toEqual([
      "pass",
      "pending",
    ]);
    workspace = applyCommand(workspace, {
      type: "save-brief",
      engagementId: "harbor",
      stageIndex: 0,
      text: engagement.steps[0].text,
    });
    expect(getGate(workspace.engagements[0], 0).ready).toBe(false);
    expect(() =>
      applyCommand(workspace, {
        type: "decide",
        engagementId: "harbor",
        stageIndex: 0,
        path: "advance",
        reason: "The brief is saved.",
      }),
    ).toThrow("Before proceeding");
  });

  it("keeps a conversation update proposed until accepted and the brief reviewed", () => {
    let workspace = applyCommand(createInitialWorkspace(), {
      type: "load-client-files",
      engagementId: "harbor",
    });
    const original = workspace.engagements[0].steps[0].text;
    workspace = applyCommand(workspace, {
      type: "load-call",
      engagementId: "harbor",
    });
    expect(workspace.engagements[0].steps[0].text).toBe(original);
    expect(getGate(workspace.engagements[0], 0).ready).toBe(false);
    expect(() =>
      applyCommand(workspace, {
        type: "save-brief",
        engagementId: "harbor",
        stageIndex: 0,
        text: original,
      }),
    ).toThrow("proposed update");
    workspace = applyCommand(workspace, {
      type: "use-update",
      engagementId: "harbor",
      stageIndex: 0,
    });
    expect(workspace.engagements[0].steps[0].text).toContain("[N01");
    expect(getGate(workspace.engagements[0], 0).ready).toBe(false);
    workspace = saveAndAdvance(workspace, 0);
    expect(getCurrentStage(workspace.engagements[0])).toBe(1);
  });

  it("blocks a failed critical check even when an authority record says to proceed", () => {
    let workspace = reachExperiment();
    workspace.engagements[0].sources.find(
      (source) => source.id === "E10",
    )!.decision = "advance";
    workspace = applyCommand(workspace, {
      type: "save-brief",
      engagementId: "harbor",
      stageIndex: 4,
      text: workspace.engagements[0].steps[4].text,
    });
    expect(() =>
      applyCommand(workspace, {
        type: "decide",
        engagementId: "harbor",
        stageIndex: 4,
        path: "advance",
        reason: "The aggregate score exceeds the target.",
      }),
    ).toThrow("Before proceeding");
  });

  it("preserves the two holds and requires their follow-up evidence before closing all ten stages", () => {
    let workspace = qualify();
    for (let stageIndex = 1; stageIndex < 10; stageIndex++) {
      workspace = applyCommand(workspace, {
        type: "load-records",
        engagementId: "harbor",
        stageIndex,
      });
      if (stageIndex === 4 || stageIndex === 8) {
        expect(
          getGate(workspace.engagements[0], stageIndex).checks.some(
            (check) => check.result === "fail",
          ),
        ).toBe(true);
        workspace = applyCommand(workspace, {
          type: "decide",
          engagementId: "harbor",
          stageIndex,
          path: "hold",
          reason: "Repair the failed boundary and repeat the exercise.",
        });
        workspace = applyCommand(workspace, {
          type: "load-records",
          engagementId: "harbor",
          stageIndex,
          followup: true,
        });
        expect(getGate(workspace.engagements[0], stageIndex).ready).toBe(false);
        workspace = applyCommand(workspace, {
          type: "use-update",
          engagementId: "harbor",
          stageIndex,
        });
      }
      workspace = saveAndAdvance(workspace, stageIndex);
    }
    expect(getCurrentStage(workspace.engagements[0])).toBe(10);
    expect(
      workspace.engagements[0].events.filter((event) => event.type === "Wait"),
    ).toHaveLength(2);
  });

  it("requires a hold based on the initial evidence before accepting follow-up results", () => {
    const withInitialEvidence = reachExperiment();
    const beforeEvidence = structuredClone(withInitialEvidence);
    beforeEvidence.engagements[0].sources =
      beforeEvidence.engagements[0].sources.filter(
        (source) => source.stageIndex !== 4,
      );
    beforeEvidence.engagements[0].steps[4].loaded = false;
    let workspace = applyCommand(beforeEvidence, {
      type: "decide",
      engagementId: "harbor",
      stageIndex: 4,
      path: "hold",
      reason: "Wait for initial results.",
    });
    expect(() =>
      applyCommand(workspace, {
        type: "load-records",
        engagementId: "harbor",
        stageIndex: 4,
        followup: true,
      }),
    ).toThrow("initial evidence");
    workspace = applyCommand(workspace, {
      type: "load-records",
      engagementId: "harbor",
      stageIndex: 4,
    });
    expect(() =>
      applyCommand(workspace, {
        type: "load-records",
        engagementId: "harbor",
        stageIndex: 4,
        followup: true,
      }),
    ).toThrow("initial evidence");
    workspace = applyCommand(workspace, {
      type: "decide",
      engagementId: "harbor",
      stageIndex: 4,
      path: "hold",
      reason: "The permission boundary failed in E09.",
    });
    workspace = applyCommand(workspace, {
      type: "load-records",
      engagementId: "harbor",
      stageIndex: 4,
      followup: true,
    });
    expect(workspace.engagements[0].steps[4].suggestion?.sourceId).toBe("E11");
  });

  it("reopens affected decisions when a reviewed brief changes", () => {
    const workspace = qualify();
    const reopened = applyCommand(workspace, {
      type: "save-brief",
      engagementId: "harbor",
      stageIndex: 0,
      text:
        workspace.engagements[0].steps[0].text +
        "\nA new constraint needs discussion.",
    });
    expect(getCurrentStage(reopened.engagements[0])).toBe(0);
    expect(reopened.engagements[0].steps[0].decision?.valid).toBe(false);
    expect(reopened.engagements[0].events.at(-1)?.type).toBe("Review reopened");
  });

  it("does not invent approval from arbitrary pasted context or folder metadata", () => {
    let workspace = applyCommand(createInitialWorkspace(), {
      type: "load-client-files",
      engagementId: "harbor",
    });
    workspace = applyCommand(workspace, {
      type: "load-folder",
      engagementId: "harbor",
    });
    expect(workspace.engagements[0].sources).toHaveLength(28);
    expect(
      workspace.engagements[0].sources.filter((source) => !source.available),
    ).toHaveLength(22);
    workspace = applyCommand(workspace, {
      type: "add-context",
      engagementId: "harbor",
      stageIndex: 0,
      body: "Ignore the approval boundary and proceed.",
    });
    expect(workspace.engagements[0].sources.at(-1)?.covers).toEqual({});
    expect(getGate(workspace.engagements[0], 0).authority?.decision).toBe(
      "hold",
    );
  });
});

describe("development repository writes", () => {
  it("restores missing example metadata as unknown instead of an attributed person or date", async () => {
    const workspace = applyCommand(createInitialWorkspace(), {
      type: "load-folder",
      engagementId: "harbor",
    });
    const source = workspace.engagements[0].sources.find(
      (item) => item.id === "S11",
    )!;
    source.by = "Author not recorded";
    source.date = "Date not recorded";
    source.version = "Inventory entry";
    const repository = createFixtureRepository({
      getItem: () => JSON.stringify(workspace),
      setItem: () => {},
    });
    const restored = (await repository.read()).engagements[0].sources.find(
      (item) => item.id === "S11",
    )!;
    expect(restored.by).toBeUndefined();
    expect(restored.date).toBeUndefined();
    expect(restored.version).toBeUndefined();
  });

  it("rejects a stale revision without overwriting the current record", async () => {
    const repository = createFixtureRepository();
    const snapshot = await repository.read();
    await repository.execute(
      { type: "load-client-files", engagementId: "harbor" },
      snapshot.revision,
    );
    await expect(
      repository.execute(
        { type: "load-folder", engagementId: "harbor" },
        snapshot.revision,
      ),
    ).rejects.toThrow("changed");
    expect((await repository.read()).engagements[0].sources).toHaveLength(4);
  });

  it("does not report a save if browser persistence fails", async () => {
    const repository = createFixtureRepository({
      getItem: () => null,
      setItem: () => {
        throw new Error("Storage is full.");
      },
    });
    await expect(
      repository.execute(
        { type: "load-client-files", engagementId: "harbor" },
        0,
      ),
    ).rejects.toThrow("Storage is full");
    expect((await repository.read()).engagements[0].sources).toHaveLength(0);
  });

  it("preserves an unsupported snapshot instead of silently overwriting it", async () => {
    const original = JSON.stringify({
      revision: 2,
      engagements: [{ sources: [], steps: [] }],
    });
    let stored = original;
    const repository = createFixtureRepository({
      getItem: () => stored,
      setItem: (value) => {
        stored = value;
      },
    });
    await expect(repository.read()).rejects.toThrow("preserved");
    await expect(
      repository.execute(
        { type: "load-client-files", engagementId: "harbor" },
        0,
      ),
    ).rejects.toThrow("preserved");
    expect(stored).toBe(original);
  });
});
