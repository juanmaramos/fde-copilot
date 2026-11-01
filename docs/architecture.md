# Architecture

## Ownership

| Layer           | Responsibility                                                                                     | Does not own                           |
| --------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FDE application | Engagement records, source references, proposals, decisions, stage requirements and change history | Host presentation or component styling |
| MCP server      | Validated tools and resources over the application; authorized access to configured sources        | A second copy of the engagement state  |
| Host adapter    | MCP Apps connection, context updates, theme, navigation and optional extensions                    | Approval rules or extraction logic     |
| React interface | Source browsing, brief editing, exceptions and decision controls                                   | Authoritative business state           |
| Apps SDK UI     | Standard controls, design tokens and interaction primitives                                        | FDE methodology or tool permissions    |
| Skills          | Instructions for gathering context and carrying out FDE work                                       | Enforcement of server permissions      |

These are code boundaries, not separate services or a monorepo requirement. Start with one repository. Introduce directories when their first implementation lands: `src/domain`, `src/mcp`, `src/host`, `src/ui`, and `skills`. Generate a portable release under `dist/plugin` once packaging exists.

The existing Deployment Workspace plugin demonstrates local stdio tools, versioned records and bundled MCP App resources. Reuse verified behavior selectively. Its handwritten bridge, Python engine and standalone UI do not become dependencies of this repository by copying the old application wholesale. Backend language and SDK versions must be selected together in the implementation change.

## Working flow

1. The user supplies client material through chat, a connector or an authorized folder.
2. The application registers its origin and revision. Read relevant content in bounded batches and retain extraction coverage and failures.
3. Copilot proposes a brief, findings and next questions, each linked to supporting passages. Material is usable as context without per-file approval.
4. The FDE checks the consolidated interpretation, consequential claims and unresolved conflicts. Ask the client only for information that affects the next decision.
5. The authorized person records a stage decision against the relevant evidence and artifact versions.
6. The companion renders the updated server record; chat can continue the same work through tools.

A source being available does not mean its entire body must be inserted into every prompt. Retrieve the relevant content and disclose gaps. A request for access supports “access requested”; it cannot establish “access granted.” Observed results and explicit commitments keep their own provenance.

## Source intake and exports

Chat attachments, connected material and the companion's future Add sources action should use the same intake operation and source register. The local service should copy direct uploads into the engagement's configured source folder, or register a link to an authorized existing file or folder. State which behavior will occur; preserve the original name, location and captured revision. The UI must not depend on a temporary chat attachment path or on symlinks as its interchange format.

Both working surfaces read the same sources, proposed findings and accepted project records. The outward path is an explicit export of briefs, workflow maps, decisions or handover material to the engagement's deliverables folder or another chosen destination. Exported work does not silently replace client originals. The current fixture adapter supports prepared examples and pasted context; real uploads, linked-folder access and file exports remain backend work.

## State and scope

Persist business records outside the UI. Keep selected rows, open sections and transient filters in UI state. Carry an explicit engagement ID through chat and panel calls; do not infer it from another panel's most recently opened project. Validate expected revisions on writes and reopen affected decisions when their supporting evidence changes.

Source processing is automatic. Show an unreadable file, a relevant revision or a conflicting account when it affects the work. Do not make people classify every file or clear a source-review queue before Copilot can draft.

## First implementation slice

Deliver one real path: register supplied context → produce a cited qualification draft → identify the next client questions → review the brief → record the qualification decision. Include one thread companion and keep the tools useful without it. No separate chat engine is needed.

Accept that slice only when chat and the companion see the same persisted record, references open the correct revision and passage, unreadable content is disclosed, stale writes are rejected, and a request or failed check cannot become approval merely through processing. Test the actual host connection as well as application rules. Later stages must add their own evidence and exit criteria before being described as implemented.

The business/UI state separation and data-tool/render-tool split follow the [official MCP UI guidance](https://developers.openai.com/plugins/build/chatgpt-ui#manage-state).
