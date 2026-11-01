export type DecisionPath = "advance" | "hold" | "revise" | "stop";
export type CheckResult = "pass" | "fail" | "pending";

export interface SourceSection {
  ref: string;
  title?: string;
  text: string;
}
export interface Finding {
  text: string;
  ref: string;
}
export interface SourceSheet {
  name: string;
  range: string;
  columns: string[];
  rows: string[][];
}

export interface SourceSeed {
  id: string;
  title: string;
  kind: string;
  by: string;
  body: string;
  covers: Record<string, CheckResult>;
  decision?: "advance" | "hold" | null;
  decisionBy?: string;
  decisionSummary?: string;
  example?: boolean;
  filename?: string;
  folder?: string;
  date?: string;
  version?: string;
  summary?: string;
  sections?: SourceSection[];
  sheet?: SourceSheet;
  note?: string;
  findings?: Finding[];
  processing?: string;
}

export interface Source extends SourceSeed {
  stageIndex: number;
  revision: number;
  available: boolean;
}

export interface StageDefinition {
  id: string;
  name: string;
  group: number;
  title: string;
  document: string;
  authority: string;
  you: string[];
  copilot: string;
  questions: string[];
  criteria: [string, string][];
  exit: string;
  worksheet: string;
  next: string;
}
export interface StagePackage {
  records: SourceSeed[];
  followup?: SourceSeed[];
  draft: string;
}
export interface ClientQuestion {
  who: string;
  when: string;
  question: string;
  why: string;
  refs: { id: string; anchor: string }[];
  answer?: { text: string; refs: { id: string; anchor: string }[] };
}
export interface ClientIntake {
  records: SourceSeed[];
  draft: string;
  questions: ClientQuestion[];
}
export interface ClientCall {
  title: string;
  by: string;
  date: string;
  body: string;
  sections: SourceSection[];
  findings: Finding[];
}
export interface RecordedDecision {
  path: DecisionPath;
  reason: string;
  authority: string;
  sourceId?: string;
  sourceVersions: Record<string, number>;
  valid: boolean;
}
export interface StageWork {
  loaded: boolean;
  followup: boolean;
  followupAvailable: boolean;
  questions: ClientQuestion[];
  text: string;
  savedText: string;
  reviewed: boolean;
  suggestion?: { sourceId: string; text: string; findings: Finding[] };
  decision?: RecordedDecision;
}
export interface EngagementEvent {
  stageIndex: number;
  type: string;
  reason: string;
}
export interface Engagement {
  id: string;
  client: string;
  problem: string;
  operator: string;
  constraint: string;
  example: boolean;
  sources: Source[];
  steps: StageWork[];
  events: EngagementEvent[];
}
export interface Workspace {
  revision: number;
  engagements: Engagement[];
}

export type WorkspaceCommand =
  | {
      type: "create";
      client: string;
      problem: string;
      operator: string;
      constraint: string;
    }
  | { type: "load-client-files"; engagementId: string }
  | { type: "load-folder"; engagementId: string }
  | {
      type: "load-records";
      engagementId: string;
      stageIndex: number;
      followup?: boolean;
    }
  | {
      type: "save-brief";
      engagementId: string;
      stageIndex: number;
      text: string;
    }
  | { type: "use-update"; engagementId: string; stageIndex: number }
  | { type: "keep-brief"; engagementId: string; stageIndex: number }
  | {
      type: "add-context";
      engagementId: string;
      stageIndex: number;
      body: string;
      title?: string;
    }
  | { type: "load-call"; engagementId: string }
  | {
      type: "decide";
      engagementId: string;
      stageIndex: number;
      path: DecisionPath;
      reason: string;
    };

export interface EngagementRepository {
  read(): Promise<Workspace>;
  execute(
    command: WorkspaceCommand,
    expectedRevision: number,
  ): Promise<Workspace>;
}
