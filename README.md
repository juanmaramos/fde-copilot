# FDE Copilot

A reusable foundation for taking a client problem through discovery, delivery, operation and closure, with chat as the main working surface and a companion that keeps the engagement record.

**Status:** architecture and contribution baseline. There is no installable plugin, connected model or application runtime in this repository yet. The earlier standalone prototype is not included.

## Start here

- [Architecture](docs/architecture.md): ownership, data flow and the first delivery slice.
- [UI library](docs/ui-library.md): consume OpenAI components without maintaining a fork.
- [Plugin extensions](docs/plugin-extensions.md): connect the companion to its host.
- [Contributing](CONTRIBUTING.md): build and review conventions for future implementation.

## Foundation decision

Consume `@openai/apps-sdk-ui` as a pinned dependency. Build FDE-specific views by composing its components. Use MCP Apps for the portable UI bridge and OpenAI MCP Extensions for supported host capabilities. Keep FDE rules and durable records in our application, behind validated tools.

Others can reuse this repository's conventions and future implementation under the [MIT license](LICENSE). Upstream dependencies retain their own licenses.
