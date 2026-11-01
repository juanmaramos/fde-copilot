import type { StagePackage } from "../domain/types";

export const stagePackages: StagePackage[] = [
  {
    records: [
      {
        id: "E01",
        title: "Sponsor and coordinator conversation",
        kind: "Interview",
        by: "Maya Ortiz, Head of Operations; Alex Chen, coordinator",
        body: "About 100 project requests arrive each week. Coordinators manually find the right team and chase missing details. Requests sometimes have no clear owner.\n\nMaya owns the outcome and can fund a five-week engagement. Alex can provide weekly observation time. The IT owner can grant a scoped test-system connection.\n\nThe request for AI is a proposed solution. Actual effort, error rates and the useful first slice still need measurement.",
        covers: {
          value: "pass",
          access: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E02",
        title: "Discovery authorized",
        kind: "Decision record",
        by: "Maya Ortiz · Client sponsor",
        body: "Authorize discovery with production coordinators and IT. Establish the baseline and agree the first slice before committing to a launch scope.\n\nAuthority: client sponsor. This authorizes discovery; it does not accept a production solution.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Problem: project requests wait while coordinators find the right team and chase missing details. Some requests have no clear owner. [E01]\nSponsor: Maya Ortiz, Head of Operations. [E01]\nPeople: production coordinators; Alex Chen can make time for observation each week. [E01]\nAccess: IT can provide a limited connection to the test system. [E01]\nFunding: Maya can fund a five-week engagement. This establishes capacity, not approval to build. [E01]\nClient request: launch next month, keep the existing project system and leave commercial approval with people. The launch date still needs a feasibility check. [Client request]\nStill unknown: actual time spent, error rates, the useful first change and what the client will accept. [E01]\nRecommendation: proceed to a scoping discussion, subject to the sponsor’s go-ahead for discovery. Record that decision separately.",
  },
  {
    records: [
      {
        id: "E03",
        title: "First slice and acceptance boundary",
        kind: "Working agreement",
        by: "Maya Ortiz and Alex Chen",
        body: "Outcome: route eligible project requests with less coordinator effort and no lost or unauthorized assignments.\n\nFirst slice: recommend a receiving team, show missing information and write an assignment only after coordinator confirmation. Unclear requests stay in an owned review queue. Three coordinators use the existing project system.\n\nExcluded: quoting, commercial approval, automatic assignment and supplier workflows. Launch means a controlled release of this assisted slice.\n\nAlex accepts workflow usefulness. Elena Ruiz, IT service owner, authorizes release. Noah Singh receives operations; Leila Brooks receives maintenance. Maya accepts the commission. Support ends 10 business days after handover; ongoing maintenance must be funded.",
        covers: {
          scope: "pass",
          acceptance: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E04",
        title: "Scope and acceptance agreed",
        kind: "Decision record",
        by: "Maya Ortiz · Client sponsor",
        body: "Approve the assisted intake slice and the named acceptance authorities in E03. Target a five-week engagement, subject to evidence at each review. A broader autonomous workflow requires separate scope.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Outcome: reduce coordinator routing effort without lost or unauthorized assignments. [E03]\nFirst slice: assisted team recommendation and missing-detail prompts in the existing project system. [E03]\nHuman boundary: a coordinator confirms every assignment. Unclear requests stay in review. [E03]\nExcluded: quoting, commercial approval, automatic assignment and supplier work. [E03]\nAcceptance: Alex for usefulness; Elena for release; Noah for operations; Leila for maintenance; Maya for the commission. [E03–E04]\nSupport: 10 business days after handover; funded maintenance is an acceptance condition. [E03]",
  },
  {
    records: [
      {
        id: "E05",
        title: "Three requests followed to final state",
        kind: "Observation",
        by: "Alex Chen · Coordinator walkthrough",
        body: "Ordinary: a complete design brief enters the queue; a coordinator checks the client and confirms the design team; the project system records the team and a receipt.\n\nException: a request could belong to design or video and lacks a deliverable. It stays with the intake coordinator, who asks for clarification. It must not disappear into an unowned queue.\n\nFailure: an assignment write times out. The coordinator checks the request ID in the project system before retrying, to avoid a duplicate action.\n\nData: client ID, request text, deliverable and receiving team. Owners: intake coordinator for unresolved work, receiving lead after a confirmed handoff.",
        covers: {
          cases: "pass",
          map: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E06",
        title: "Workflow corrected and confirmed",
        kind: "Decision record",
        by: "Alex Chen · Workflow owner",
        body: "The map in E05 matches the work after correction: the intake coordinator retains an ambiguous request until the receiving team acknowledges it. Written routing policy has been checked with Operations. Proceed to option selection.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Input → validate client and details → recommend team → coordinator confirms → project system writes assignment → receiving team acknowledges. [E05]\nOrdinary: complete brief reaches the correct team with a receipt. [E05]\nException: ambiguous or incomplete brief stays with the intake coordinator until clarification. [E05–E06]\nFailure: timeout requires checking downstream state before retrying. [E05]\nRequired behavior: no unowned request, no unconfirmed write and no duplicate assignment. [E05–E06]\nPolicy: intake retains ownership until an acknowledged handoff. [E06]",
  },
  {
    records: [
      {
        id: "E07",
        title: "Options, baseline and quality bar",
        kind: "Measurement plan",
        by: "Alex Chen and delivery lead",
        body: "Comparator: current manual routing. Baseline: 50 recent eligible requests across normal and exception work. Median active coordinator effort was 7.8 minutes per request, including clarification and correction. Use the same eligibility and work mix in the pilot; include bypassed and failed requests.\n\nOptions: improve the intake form; use explicit client/team rules; use a model recommendation with coordinator approval. Rules cover stable mappings but not the useful free-text ambiguity. Keep the form repair and rules, then test an assisted model recommendation.\n\nTargets: pilot median active effort at or below 4 minutes; at least 95% appropriate recommendations on held-out assessment; every critical ambiguity and action-permission case passes. Guardrails: no lost, duplicate or unapproved assignment.\n\nOperating limits: service cost at or below €50/week and routine support at or below 1 hour/week. Maintenance and coordinator review are included in the value decision.",
        covers: {
          options: "pass",
          metrics: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E08",
        title: "First experiment approved",
        kind: "Decision record",
        by: "Alex Chen · Workflow owner",
        body: "Approve the assisted recommendation experiment and measurement definitions in E07. Compare against manual routing and rules. Do not allow model output to authorize an assignment.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Options: improve intake, use deterministic mappings, or add model recommendations with human confirmation. [E07]\nChosen test: retain form/rule improvements and test useful remaining free-text ambiguity. [E07–E08]\nBaseline: 50 eligible requests; 7.8-minute median active effort, including exceptions and correction. [E07]\nPilot target: ≤4 minutes using the same definition and comparable work mix. [E07]\nAssessment: ≥95% appropriate recommendations; all critical cases pass. [E07]\nGuardrails: zero lost, duplicate or unapproved assignments. [E07]\nOperating limits: ≤€50/week service cost and ≤1 hour/week routine support, with maintenance included. [E07]",
  },
  {
    records: [
      {
        id: "E09",
        title: "First assessment: permission failure",
        kind: "Verification",
        by: "Delivery engineer and Alex Chen · r0.1",
        body: "Candidate r0.1. Assessment uses 90 held-out requests, separate from development: 60 ordinary, 20 incomplete and 10 ambiguous or action-permission cases. Comparators are manual routing and deterministic mappings.\n\nRecommendations: 87/90 appropriate. Critical permission check: a request containing instructions to bypass review caused one assignment without coordinator confirmation. Expected: no write before confirmation. Actual: one unapproved write.\n\nThe average recommendation result exceeds 95%, but a critical guardrail fails. No pilot is authorized.",
        covers: {
          valid: "pass",
          quality: "fail",
        },
        decision: null,
        example: true,
      },
      {
        id: "E10",
        title: "Hold for permission repair",
        kind: "Decision record",
        by: "Alex Chen · Workflow owner",
        body: "Hold the candidate. Enforce coordinator confirmation outside the model and reassess the candidate on a fresh held-out set, including the failed action boundary.",
        covers: {},
        decision: "hold",
        example: true,
      },
    ],
    followup: [
      {
        id: "E11",
        title: "Reassessment after permission repair",
        kind: "Verification",
        by: "Delivery engineer and Alex Chen · r0.2",
        body: "Candidate r0.2 enforces confirmation in the application and keeps ambiguous requests in the owned review queue. Assessment uses a fresh, disjoint 90-case set with the same mix.\n\nRecommendations: 88/90 appropriate. Every critical case passes; no unapproved write. Two noncritical recommendations were corrected in human review. Coordinators completed the reviewed cases successfully.\n\nExpected behavior and actual outputs are retained by case. This resolves the E09 failure for r0.2; integration still needs verification.",
        covers: {
          valid: "pass",
          quality: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E12",
        title: "Candidate accepted for integration",
        kind: "Decision record",
        by: "Alex Chen · Workflow owner",
        body: "Accept r0.2 for integration work based on E11. Human confirmation remains mandatory; this is not production authorization.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Hypothesis: assisted recommendations can meet the agreed quality bar while preserving coordinator control. [E07–E08]\nFirst result: r0.1 exceeded the average quality target but made an unapproved write. Hold. [E09–E10]\nRepair: application-enforced confirmation; ambiguous work stays in review. [E11]\nReassessment: fresh held-out set; 88/90 appropriate recommendations, all critical cases pass, zero unapproved writes. [E11]\nOperator usefulness: reviewed cases completed; two corrections remained visible. [E11]\nDecision: proceed to real integration checks for the repaired candidate. [E12]",
  },
  {
    records: [
      {
        id: "E13",
        title: "Integrated candidate verification",
        kind: "Verification",
        by: "Leila Brooks · Technical owner · r0.3",
        body: "Candidate r0.3 adds the project-system integration to the repaired recommendation behavior. Authorized test environment uses the real scoped interface. Request R-104 was submitted, confirmed, assigned and acknowledged in the downstream system.\n\nChecks passed: access isolation; request text cannot grant action authority; no write without coordinator confirmation; repeat confirmation does not duplicate the assignment. A timeout after an accepted write was reconciled by request ID before retry. Manual queue fallback was exercised.\n\nThe 90-case assessment was rerun on r0.3: quality target and every critical case pass. Exact revision, expected and actual results are in the check record.",
        covers: {
          integration: "pass",
          recovery: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E14",
        title: "Integration accepted for a bounded pilot",
        kind: "Decision record",
        by: "Leila Brooks · Technical owner",
        body: "Accept r0.3 integration evidence in E13. Authorize preparation of the one-coordinator pilot under the agreed action boundary. Production release requires Elena’s separate authorization.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Candidate: r0.3 in the authorized test environment with the real scoped project-system interface. [E13]\nComplete path: request R-104 → human confirmation → downstream assignment → receipt verified. [E13]\nPermissions: access isolation and application-enforced confirmation pass. [E13]\nRecovery: repeated confirmation is idempotent; timeout after write is reconciled by request ID. [E13]\nFallback: manual queue exercised. Assessment rerun on r0.3 passes critical cases and quality target. [E13]\nAuthority: technical owner accepts a bounded pilot; production authorization remains separate. [E14]",
  },
  {
    records: [
      {
        id: "E15",
        title: "Two-week pilot readout",
        kind: "Pilot readout",
        by: "Alex Chen · One coordinator · r0.3",
        body: "Scope: r0.3, one coordinator, two weeks, 60 eligible requests. Every assignment requires confirmation. Delivery lead provides support. Pause on any lost, duplicate or unapproved assignment, budget breach or inability to recover.\n\nOutcome: median active coordinator effort 3.2 minutes versus the 7.8-minute baseline. All 60 requests remain in the denominator, including 6 manual bypasses and 1 corrected recommendation. Work mix was comparable; this is a small, non-random comparison, not a causal savings claim.\n\nOf 54 recommendations used, 53 were appropriate. No lost, duplicate or unapproved assignment. All observed exceptions remained owned. Bypasses were explained in the readout.\n\nService cost was €12 and €14 for the two weeks; support effort was 0.7 and 0.8 hours. Ongoing maintenance ownership and funding remain required. No cash-saving claim is made.",
        covers: {
          trial: "pass",
          value: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E16",
        title: "Bounded expansion supported",
        kind: "Decision record",
        by: "Alex Chen · Workflow owner",
        body: "The pilot supports release review for the same assisted workflow to the three coordinators in scope. Retain human confirmation and the manual fallback. Do not extend to other teams or autonomous assignment.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Pilot: r0.3, one coordinator, two weeks, 60 eligible requests. Permissions, support and pause conditions were explicit. [E15]\nOutcome: 3.2-minute median versus 7.8 baseline; review, correction and bypassed work included. [E15]\nQuality: 53/54 used recommendations appropriate; 6 requests bypassed. Guardrails: no lost, duplicate or unapproved assignment. [E15]\nCost and burden: €12–14 service cost/week and 0.7–0.8 support hours/week; maintenance funding still required. [E15]\nLimits: small non-random comparison, one coordinator, no causal or cash-saving claim. [E15]\nDecision: review release to the three coordinators already in scope. [E16]",
  },
  {
    records: [
      {
        id: "E17",
        title: "Readiness and cutover authorization",
        kind: "Readiness review",
        by: "Elena Ruiz · Release owner · r0.3",
        body: "Candidate r0.3 is unchanged from the pilot. Scope: three coordinators, assisted intake only. Scoped access, client data handling and retention, confirmation enforcement and check results are reviewed.\n\nMonitoring covers stuck requests, downstream failures, duplicate actions and service cost. Elena is cutover authority; Leila responds during the observation window.\n\nRecovery rehearsal passed: disable assisted writes, use the manual queue, reconcile incomplete actions by request ID. Version/data compatibility was checked; no destructive data migration is involved.\n\nElena authorizes the bounded cutover after the readiness review. Observe five business days with the stated stop conditions.",
        covers: {
          ready: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E18",
        title: "Release and five-day stabilization record",
        kind: "Release record",
        by: "Elena Ruiz and Leila Brooks · r0.3",
        body: "After E17 authorization, r0.3 was released to the three coordinators. A request was confirmed, assigned and acknowledged in the downstream system after cutover.\n\nThe five-business-day window is complete. No lost, duplicate or unapproved assignment occurred. Alerts reached the named responder; a controlled failure used the rehearsed manual fallback and reconciliation path. Costs stayed within the agreed limit. Operating observations are retained.",
        covers: {
          stable: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E19",
        title: "Release review complete",
        kind: "Decision record",
        by: "Elena Ruiz · Release owner",
        body: "Accept the authorized release and stabilization evidence for r0.3. The service is live within scope. Receiving-team independence and support-end acknowledgement remain open for transfer.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Candidate and scope: unchanged r0.3; three coordinators; assisted intake. [E17]\nReadiness: applicable client requirements, access, retained records, confirmation and exact-candidate checks reviewed. [E17]\nRecovery: disable assisted writes, use the manual queue and reconcile by request ID; compatibility checked. [E17]\nAuthority: Elena authorized cutover; Leila covered the observation window. [E17]\nExecution: post-cutover request reached the downstream team with a receipt. [E18]\nStabilization: five business days complete within guardrails, including an alert/recovery exercise. [E18–E19]\nStill open: receiver-led transfer and final acceptance. [E19]",
  },
  {
    records: [
      {
        id: "E20",
        title: "Receiver rehearsal: recovery gap",
        kind: "Handover exercise",
        by: "Noah Singh · Receiving operations owner",
        body: "Noah completed an ordinary request and the missing-detail exception independently. During a simulated timeout after write, he could not determine whether the project system had accepted the assignment. The delivery engineer reconciled it.\n\nExpected: receiver detects, checks downstream state and safely recovers without delivery-team help. Actual: delivery engineer intervention. The recovery exercise fails.\n\nLeila demonstrated a routine routing-rule change with regression checks, but the operating escalation and support-end acknowledgement remain unsigned.",
        covers: {
          independent: "fail",
          ownership: "fail",
        },
        decision: null,
        example: true,
      },
      {
        id: "E21",
        title: "Transfer held",
        kind: "Decision record",
        by: "Noah Singh · Receiving owner",
        body: "Do not transfer operating responsibility yet. Clarify the state-check procedure, repeat the controlled failure and agree the operating boundary.",
        covers: {},
        decision: "hold",
        example: true,
      },
    ],
    followup: [
      {
        id: "E22",
        title: "Receiver rehearsal and ownership accepted",
        kind: "Handover exercise",
        by: "Noah Singh and Leila Brooks · r0.3 · runbook v2",
        body: "Runbook v2 now shows how to check downstream state by request ID before a retry. No software change was made to r0.3.\n\nNoah independently completed the normal path, the missing-detail exception and a timeout-after-write recovery. The receipt and absence of duplicate assignments were verified. Leila demonstrated a routine rule change and its regression checks.\n\nNoah accepts workflow operations and first response. Leila accepts maintenance and escalation. Both have the required access. They acknowledge the runbook, agreed support route and delivery support ending 10 business days after handover. Ongoing maintenance is funded by Operations.",
        covers: {
          independent: "pass",
          ownership: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E23",
        title: "Receiving ownership acknowledged",
        kind: "Decision record",
        by: "Noah Singh · Receiving owner",
        body: "Accept the operating transfer based on E22, including the maintenance owner, support end and escalation route. The delivery engineer is no longer required for routine operation or recovery.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "First rehearsal: normal and exception work passed, but the receiver needed delivery-team help to reconcile a timeout. Transfer held. [E20–E21]\nChange: runbook v2 explains the existing request-ID state check; r0.3 is unchanged. [E22]\nRepeat exercise: Noah completed normal, exception and controlled-failure recovery independently. Leila demonstrated a routine change and regression checks. [E22]\nOwnership: Noah operates and responds; Leila maintains and escalates. Access and runbook acknowledged. [E22–E23]\nSupport: delivery cover ends 10 business days after handover. Operations funds maintenance. [E22]",
  },
  {
    records: [
      {
        id: "E24",
        title: "Scope reconciliation and client acceptance",
        kind: "Acceptance record",
        by: "Maya Ortiz · Client sponsor",
        body: "Accept the assisted intake workflow for the three coordinators, with the agreed outcome, action boundary, release evidence and acknowledged receiving ownership. Pilot evidence supports useful reduction in effort within its stated limits.\n\nAutonomous assignment, quoting and supplier workflows were excluded and remain separate opportunities. No promised scope is silently deferred.\n\nRemaining obligations: Leila owns the 30-day value review, funded by Operations; Noah owns routine service review; the delivery lead provides the agreed 10-business-day support window. Owners acknowledge dates, responsibilities and funding.",
        covers: {
          accepted: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E25",
        title: "Support, access and service disposition",
        kind: "Closure checklist",
        by: "Elena Ruiz and delivery lead",
        body: "The live service remains under Noah and Leila; it is not being retired. Temporary test jobs are removed and the test data set is deleted according to the agreed policy.\n\nDelivery-team production write access is revoked. Narrow read-only support access expires at the end of the agreed support window. Client-owned records follow the agreed retention schedule under Elena. Repository, runbook and service access are with the receiving team.\n\nThe reusable lesson is sanitized: enforce action authority outside the model and rehearse receiver recovery. Client data is excluded from reuse.",
        covers: {
          disposition: "pass",
        },
        decision: null,
        example: true,
      },
      {
        id: "E26",
        title: "Commission accepted and closed",
        kind: "Decision record",
        by: "Maya Ortiz · Client sponsor",
        body: "Accept the commissioned result and close the engagement based on E24–E25. The remaining dated obligations and support window have accepted owners and funding. Future autonomous routing is separate scope.",
        covers: {},
        decision: "advance",
        example: true,
      },
    ],
    draft:
      "Accepted result: assisted intake for three coordinators, released and transferred within the agreed boundary. [E24]\nEvidence: useful pilot result with stated limits, verified release and receiver-led transfer. [E15, E18, E22]\nRemaining obligations: Leila owns the funded 30-day value review; Noah owns service review; delivery lead owns the agreed support window. [E24]\nDisposition: service remains owned; temporary jobs/test data removed; delivery write access revoked; support read access expires with support. [E25]\nReusable lesson: enforce action authority outside the model and prove independent recovery. No client data in reuse. [E25]\nFuture work: autonomous assignment, quoting and supplier workflows are separate scope. [E24–E26]",
  },
];
