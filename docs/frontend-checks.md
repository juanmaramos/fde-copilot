# Frontend verification

The frontend uses prepared fictional data through `EngagementRepository`. These checks establish interface and sample-flow behavior, not deployed AI quality or production authorization. Backend services and an actual MCP host connection remain unimplemented.

## Checks

- `npm test`: workflow rules and React interactions, including all ten example stages, the two failed-result detours, stale writes, storage failures, source references, list return state, aliases and unsaved edits.
- `npm run build`: strict TypeScript and one self-contained resource at `dist/ui/index.html`; no external script or stylesheet tags are required to display it.
- Browser: supplied examples produce a qualification draft; the cited access email opens its exact paragraph; returning preserves the work; saving the brief cannot grant access. The follow-up transcript remains a proposal until applied and reviewed, after which a separate recorded decision enables Frame.
- Responsive browser checks: 320, 390, 548, 800 and 1280px widths, with no page-level horizontal overflow on the checked source and overview views. Narrow source details have one Sources return link and omit list filters. The floating tab bar is reserved for narrow views; wide views keep the sidebar.
- The SDK switcher opens by pointer or arrow key. Name hiding changes navigation labels and the document title, while source content remains visible.

The PR records the final test count, bundle size and isolated regression-mutation result. No installed-plugin or live-service result is claimed.

## Dependency review

On 1 November 2026, `npm audit --omit=dev` reports six upstream entries through Apps SDK UI 0.2.2: one high, one moderate and four low. They include Lodash template/prototype-pollution advisories and a KaTeX trust advisory. No forced overrides or package fork were introduced.

The interface does not import Slider or Markdown/math rendering. The audited SDK imports Lodash clamp/round in Slider; the reported template, unset and omit paths are not used by this UI. The KaTeX stylesheet is part of the SDK foundation, but this interface does not execute its math renderer. This is a reachability assessment, not a clean audit result. Recheck the dependency graph before plugin release or enabling additional SDK features.

References: [Lodash code injection](https://github.com/advisories/GHSA-r5fr-rjxr-66jc), [Lodash prototype pollution](https://github.com/advisories/GHSA-f23m-r3pf-42rh), [KaTeX trust advisory](https://github.com/advisories/GHSA-238p-pmpm-9mq7).

The UI patterns were checked against OpenAI's [list example](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-list), [Kitchen Sink Lite](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/kitchen-sink-lite) and [Bits & Bolts](https://github.com/openai/mcp-extensions/tree/main/plugins/bits-and-bolts). Components are consumed from the package; example implementations were not copied into this app.
