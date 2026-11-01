# fde studio

A reusable foundation for taking a client problem through discovery, delivery, operation and closure, with chat as the main working surface and a companion that keeps the engagement record.

**Status:** React frontend with a separate sample-data adapter. The Harbor Studio walkthrough covers all ten stages, including failed checks, follow-up evidence, brief review and closure. Backend services, AI extraction and the MCP host connection are not implemented. The earlier standalone prototype is not included.

## Run the interface

Use Node 22.22+ or 24+ and npm:

```sh
npm ci --ignore-scripts
npm run dev
npm test
npm run build
```

The development server opens at `http://127.0.0.1:4769`. The production build emits one self-contained UI resource at `dist/ui/index.html`. This is the frontend the plugin will use, not an installable plugin package. The future resource handler can set `data-routing="embedded"` on the HTML root to use the same routes in memory inside a host surface.

Example progress stays in the current browser tab through refreshes. The fixture adapter is not production authorization or shared persistence. Keep client records out of this public repository.

## Start here

- [Architecture](docs/architecture.md): ownership, data flow and the first delivery slice.
- [UI library](docs/ui-library.md): consume OpenAI components without maintaining a fork.
- [Plugin extensions](docs/plugin-extensions.md): connect the companion to its host.
- [Contributing](CONTRIBUTING.md): build and review conventions for future implementation.

`src/ui` contains the product components, `src/domain` the workflow rules, `src/data` the repository contract and sample adapter, and `src/fixtures` the fictional source material. Functions and components are named by responsibility; the product name belongs in presentation and package metadata.

## Foundation decision

Consume `@openai/apps-sdk-ui` as a pinned dependency. Build FDE-specific views by composing its components. Use MCP Apps for the portable UI bridge and OpenAI MCP Extensions for supported host capabilities. Keep FDE rules and durable records in our application, behind validated tools.

Others can reuse this repository's conventions and future implementation under the [MIT license](LICENSE). Upstream dependencies retain their own licenses.
