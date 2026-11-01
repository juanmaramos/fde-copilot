# Contributing

Start with the [architecture](docs/architecture.md). Run `npm test` for workflow and interface behavior, and `npm run build` for strict TypeScript checks and the self-contained UI resource. Use `npm run dev` for browser checks. Backend and MCP host verification remain separate work.

## Change policy

Keep each change focused on one working outcome. Describe the problem, resulting behavior and evidence that it works. Use fictional fixtures; never commit client material, access credentials or local machine paths.

Before adding a dependency, check whether an existing package covers the need. Use the public Apps SDK UI entrypoints instead of copying controls. Select compatible package versions, commit the package-manager-generated lockfile, inspect advisories and review install scripts before executing them.

For runtime work, test the rules that could permit a wrong decision, stale write, cross-engagement access or fabricated result. Verify the actual host bridge for integration changes. A browser-only imitation does not establish that a plugin extension works.

Review correctness, readability, architecture, security and performance before pushing. Demonstrate that a relevant regression test detects the faulty behavior when changing a rule. Documentation-only changes need accurate examples, valid links and a consistent statement of implementation status; do not add a test suite that merely repeats prose.

Use a pull request for review. A passing build does not replace review, and creating a pull request does not authorize merging it.
