# Plugin integration contract

## Three separate packages of responsibility

- **Apps SDK UI** supplies React controls and design tokens.
- **MCP Apps** supplies the portable UI resource and host bridge.
- **OpenAI MCP Extensions** adds host surfaces and capabilities such as a conversation panel, sidebar entrypoint, file viewer and composer interaction.

Using an extension does not require Apps SDK UI, and importing a component does not register an extension. fde studio uses both for different responsibilities. See the [official extensions overview](https://developers.openai.com/plugins/build/extensions).

## Host integration

Use the MCP Apps bridge for tool results, tool calls and model-context updates. Keep data tools separate from render tools; attach `_meta.ui.resourceUri` to the tool that opens the view. Serve a registered resource with MIME type `text/html;profile=mcp-app`.

Use the official `@modelcontextprotocol/ext-apps` client and `@openai/mcp-extensions/app` adapter rather than maintaining a handwritten JSON-RPC bridge. Register result/input handlers before connection so the first tool result is not missed. After connecting, check whether each optional extension is supported. Give the user a useful fallback or a clear explanation when it is unavailable.

The audited [TypeScript integration guide](https://github.com/openai/mcp-extensions/blob/9e6d418439cca0790bece62f6cd886ad4c04f133/typescript/README.md) distinguishes app and server dependencies. Its server setup uses the MCP server v2 package, while the app setup uses the MCP Apps client and its SDK v1 dependency. Select compatible versions per boundary; do not combine examples from different SDK generations into one server. The backend choice remains open until implementation.

The following is the metadata shape for the first companion render tool. It is a contract example, not a registered tool in this repository:

```json
{
  "ui": {
    "resourceUri": "ui://fde-studio/companion.html",
    "visibility": ["model", "app"]
  },
  "openai/ui": {
    "entrypoints": [{ "type": "thread" }]
  }
}
```

The render tool must validate the requested engagement and any focused artifact, then return the correct snapshot. Reuse the same application record for later entrypoints. Give a changed UI bundle a new resource identity so host caches cannot silently serve old code.

## Extension priorities

| Surface or capability             | Purpose                                                   | Order                                                                |
| --------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| Conversation panel (`thread`)     | Inspect sources and review the brief beside the main chat | First slice                                                          |
| Model-context updates             | Give chat the selected engagement and artifact references | First slice; keep payloads bounded                                   |
| Sidebar app (`global`)            | Open an engagement without starting from a message        | After the first slice works                                          |
| Deep links                        | Open a specific engagement item                           | With sidebar navigation                                              |
| Editable chat draft               | Prepare a discussion prompt for the user to send          | When needed; preserve the existing draft and provide a copy fallback |
| File viewers/editors              | Open formats that our viewer actually supports            | After parsing and revision handling work                             |
| Composer mentions                 | Find and attach a particular engagement item              | When search and item references are stable                           |
| Structured settings               | Configure actual product preferences                      | When preferences exist                                               |
| Recording or meeting integrations | Capture how work happens today as attributed context      | Separate source adapter; not implied by a UI component               |

Do not register every surface at startup or claim support before its flow is tested. Respect the host's capability negotiation and current availability. Prefer shared MCP Apps methods; use `window.openai` only for a needed capability not covered by the standard or supported SDK. [Bridge guidance](https://developers.openai.com/plugins/build/chatgpt-ui#start-with-mcp-apps).

## Distribution

Use a portable Agent Plugins package: root `plugin.json`, optional `mcp.json`, `skills/` and built assets. OpenAI presentation metadata belongs under `extensions.com.openai` in `plugin.json`. UI entrypoint metadata belongs on the MCP render tool. These are separate extension locations.

Choose a local stdio package for the first desktop implementation if authorized local files are required. A remote service is a separate deployment decision. Installing a local plugin does not grant arbitrary folder access or make its files available to web/cloud hosts.

Generate the installable package from reviewed source. Include compiled resources and required runtime dependencies; state any system runtime prerequisite. Do not download dependencies on first use. Keep secrets and engagement data outside the package. Validate resource paths, tool schemas and the real chat-to-panel flow before offering installation. See [official packaging guidance](https://developers.openai.com/plugins/build/plugins).
