import type { StageDefinition } from "./types";

const stageIds = [
  "qualification",
  "frame",
  "discover",
  "select",
  "experiment",
  "build",
  "pilot",
  "release",
  "transfer",
  "close",
] as const;

const stageContent: Omit<StageDefinition, "id">[] = [
  {
    name: "Qualification",
    group: 0,
    title: "Decide whether to proceed",
    document: "Qualification brief",
    authority: "Client sponsor",
    you: [
      "Speak with the person responsible for the problem and someone doing the work.",
      "Find out what delays or mistakes mean for the team.",
      "Confirm who can fund discovery, share records and make time for it.",
    ],
    copilot:
      "Prepares a qualification brief from your notes and lists the questions that still need answers.",
    questions: [
      "Where does the work get delayed or go wrong? What happens as a result?",
      "Who can approve and fund discovery?",
      "Can we observe the work and access representative records?",
      "Who will own the workflow after delivery?",
    ],
    criteria: [
      ["value", "The problem matters to the team and has a named sponsor"],
      ["access", "People, records and funding are available for discovery"],
    ],
    exit: "Proceed when the sponsor agrees to discovery and the team can provide time, access and funding.",
    worksheet:
      "Problem and its effect on the team:\nSponsor and who can approve discovery:\nPeople doing the work:\nAvailable records, access and time:\nFunding and constraints:\nUnanswered questions and next action:",
    next: "Agree the scope",
  },
  {
    name: "Frame",
    group: 0,
    title: "Agree the result and its limits",
    document: "Scope and acceptance brief",
    authority: "Client sponsor",
    you: [
      "Agree the first slice, exclusions and success measures.",
      "Name the people who accept the workflow, release and handover.",
    ],
    copilot:
      "Turns the request into a bounded outcome and acceptance draft. Flags commitments that lack an owner.",
    questions: [
      "What does launch mean for this client?",
      "Which actions stay with a person?",
      "What result is accepted, by whom, and with what support?",
    ],
    criteria: [
      ["scope", "Outcome, first slice and exclusions agreed"],
      ["acceptance", "Acceptance owners and support boundary agreed"],
    ],
    exit: "Client and delivery lead agree on the commissioned result.",
    worksheet:
      "Outcome:\nFirst slice:\nExcluded work:\nSuccess and guardrails:\nAcceptance and release authorities:\nSupport and ownership boundary:",
    next: "Observe the workflow",
  },
  {
    name: "Discover",
    group: 0,
    title: "Map the work as it happens",
    document: "Workflow and case map",
    authority: "Workflow owner",
    you: [
      "Watch an ordinary case, an exception and a failure.",
      "Have the operator correct the map and resolve policy questions.",
    ],
    copilot:
      "Maps inputs, decisions, data and handoffs from the observations. Links requirements to cases.",
    questions: [
      "Where does the request begin and what is the final state?",
      "What happens when information is missing or a handoff fails?",
      "Which rule is policy, and which is a workaround?",
    ],
    criteria: [
      ["cases", "Ordinary, exception and failure paths traced"],
      ["map", "Operator-corrected map with decisions, data and owners"],
    ],
    exit: "The workflow owner recognizes the map and the important exceptions.",
    worksheet:
      "Input and final state:\nOrdinary case:\nException:\nFailure and recovery:\nDecisions, data and owners:\nUnresolved policy questions:",
    next: "Choose a solution and measures",
  },
  {
    name: "Select & measure",
    group: 1,
    title: "Choose the smallest useful change",
    document: "Options and measurement plan",
    authority: "Workflow owner",
    you: [
      "Compare process changes, rules, AI and human assistance.",
      "Measure the baseline and agree targets, guardrails and costs.",
    ],
    copilot:
      "Compares options against the observed work. Drafts metric definitions and the first test.",
    questions: [
      "Could process or rules solve the important part?",
      "What exactly is the denominator and comparator?",
      "Does the measure include exceptions, review and operating effort?",
    ],
    criteria: [
      ["options", "Simpler alternatives compared against the same outcome"],
      ["metrics", "Baseline, target, guardrails and costs defined"],
    ],
    exit: "The selected slice is justified and can be judged against an agreed comparator.",
    worksheet:
      "Options and tradeoffs:\nChosen first slice:\nBaseline, population and denominator:\nTarget and quality bar:\nGuardrails and stop triggers:\nReview, operating and maintenance cost:",
    next: "Test the risky assumption",
  },
  {
    name: "Experiment",
    group: 1,
    title: "Test the assumption that could break the plan",
    document: "Experiment readout",
    authority: "Workflow owner",
    you: [
      "Run a valid comparison on held-out cases.",
      "Inspect critical failures before deciding to continue, revise or stop.",
    ],
    copilot:
      "Prepares the case rubric and groups actual results. Flags failures that averages conceal.",
    questions: [
      "What result would reject this candidate?",
      "Are assessment cases separate from development?",
      "Did software, model quality and operator usefulness each meet their bar?",
    ],
    criteria: [
      ["valid", "Valid assessment with a comparator and exact candidate"],
      ["quality", "Quality and critical checks"],
    ],
    exit: "The test is valid and the candidate meets the agreed quality bar.",
    worksheet:
      "Hypothesis and comparator:\nCandidate and assessment cases:\nSoftware result:\nModel result, when used:\nOperator result:\nCritical failures and decision:",
    next: "Build the integrated slice",
  },
  {
    name: "Build & integrate",
    group: 2,
    title: "Verify the complete path",
    document: "Integration and verification record",
    authority: "Technical owner",
    you: [
      "Build through the real interfaces and permissions.",
      "Check retries, partial completion, recovery and downstream state.",
    ],
    copilot:
      "Connects requirements to checks and records. Surfaces any part still supported only by a mock.",
    questions: [
      "What exact candidate was checked, where and by whom?",
      "What state remains after a timeout or partial write?",
      "Can another tenant or an untrusted request expand its permissions?",
    ],
    criteria: [
      ["integration", "Real input-to-downstream-state checks pass"],
      ["recovery", "Permissions, retries and recovery verified"],
    ],
    exit: "The authorized integration works end to end on the candidate entering the pilot.",
    worksheet:
      "Candidate and environment:\nRequirements and linked checks:\nPermissions and action boundaries:\nRetries and partial completion:\nRecovery and downstream reconciliation:\nPilot authority:",
    next: "Run a bounded pilot",
  },
  {
    name: "Pilot",
    group: 2,
    title: "Measure the change in real work",
    document: "Pilot and value readout",
    authority: "Workflow owner",
    you: [
      "Run a bounded trial with named support and stop conditions.",
      "Include failed, corrected, bypassed and abandoned work in the readout.",
    ],
    copilot:
      "Compares outcomes and guardrails with the baseline. Flags thin samples, hidden review effort and unsupported benefit claims.",
    questions: [
      "Who used it, who bypassed it and why?",
      "Do important case types meet their quality bar?",
      "Is the improvement useful after review and operating costs?",
    ],
    criteria: [
      ["trial", "Bounded pilot with support and stop conditions"],
      ["value", "Outcome, guardrails, adoption and total effort reviewed"],
    ],
    exit: "The evidence supports a bounded expansion, revision, stop or time-limited extension.",
    worksheet:
      "Candidate, cohort and duration:\nPermissions and stop conditions:\nOutcome versus baseline:\nFailures, corrections and bypasses:\nOperating cost and effort:\nLimitations and expansion decision:",
    next: "Review release readiness",
  },
  {
    name: "Release & stabilize",
    group: 2,
    title: "Release and verify stable operation",
    document: "Release and stabilization record",
    authority: "Release owner",
    you: [
      "Get authorization for the exact candidate and scope.",
      "Release, verify downstream behavior and observe the agreed window.",
    ],
    copilot:
      "Assembles readiness evidence and open conditions. Tracks release authorization, execution and stabilization separately.",
    questions: [
      "Can the named responder detect and recover a failure?",
      "Is rollback compatible with current data, or is another recovery needed?",
      "What observation window and downstream check establish stability?",
    ],
    criteria: [
      ["ready", "Exact candidate, client requirements and recovery ready"],
      ["stable", "Authorized release and stabilization evidenced"],
    ],
    exit: "The authorized candidate is operating within its guardrails after the agreed observation window.",
    worksheet:
      "Candidate and release authority:\nReadiness and applicable client requirements:\nMonitoring, responder and recovery:\nCutover and downstream verification:\nStabilization window and result:\nRemaining operating conditions:",
    next: "Transfer operating ownership",
  },
  {
    name: "Transfer",
    group: 3,
    title: "Have the receiver run it",
    document: "Handover and ownership record",
    authority: "Receiving owner",
    you: [
      "Have receivers demonstrate normal work, an exception and a controlled failure.",
      "Confirm routine changes, access, escalation and support boundaries.",
    ],
    copilot:
      "Prepares the receiver-led exercises and records gaps. Compares demonstrated responsibilities with the ownership plan.",
    questions: [
      "Can the receiver recover without the delivery engineer?",
      "Can the maintenance owner make a routine change?",
      "Who accepts each unresolved obligation after handover?",
    ],
    criteria: [
      ["independent", "Independent receiver exercises"],
      [
        "ownership",
        "Operating, maintenance and support ownership acknowledged",
      ],
    ],
    exit: "The receiving owners can run their scope and acknowledge the support boundary.",
    worksheet:
      "Workflow, operations and maintenance owners:\nNormal and exception exercises:\nFailure and recovery exercise:\nRoutine change exercise:\nAccess, runbook and escalation:\nAccepted obligations and support end:",
    next: "Reconcile scope and close",
  },
  {
    name: "Close & reuse",
    group: 3,
    title: "Close the commission",
    document: "Acceptance and closure record",
    authority: "Client sponsor",
    you: [
      "Reconcile agreed scope with the result the client accepts.",
      "Assign remaining obligations and settle access, data, temporary services and support end.",
    ],
    copilot:
      "Prepares the scope reconciliation and obligations list. Extracts a reusable lesson for the next engagement.",
    questions: [
      "Is the commissioned result accepted, partial, stopped or transferred?",
      "Does every obligation have an accepted owner, date and funding?",
      "What remains in service and what should end?",
    ],
    criteria: [
      ["accepted", "Client accepts the scoped result and owned obligations"],
      [
        "disposition",
        "Support end, access, data and service disposition agreed",
      ],
    ],
    exit: "The commissioned result is accepted and every remaining obligation has an accepted disposition.",
    worksheet:
      "Commissioned scope and delivered result:\nClient acceptance and limitations:\nRemaining obligations with owner, date and funding:\nSupport end:\nData, access and service disposition:\nReusable lesson and separate future work:",
    next: "View the completed engagement",
  },
];

export const stages: StageDefinition[] = stageContent.map((stage, index) => ({
  id: stageIds[index]!,
  ...stage,
}));
