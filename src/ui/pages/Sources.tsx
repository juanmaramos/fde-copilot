import { useEffect } from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { EmptyMessage } from "@openai/apps-sdk-ui/components/EmptyMessage";
import { Input } from "@openai/apps-sdk-ui/components/Input";
import {
  Email,
  File,
  FileDocument,
  FilePresentation,
  FileSpreadsheet,
} from "@openai/apps-sdk-ui/components/Icon";
import { Select } from "@openai/apps-sdk-ui/components/Select";
import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import {
  Link,
  useFetcher,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router";
import type { Source, SourceSection } from "../../domain/types";
import { stages } from "../../domain/stages";
import { useEngagement } from "../../data/context";
import {
  readSessionValue,
  writeSessionValue,
} from "../../data/browser-storage";
import {
  sourceAnchor,
  type SourceReturnContext,
} from "../components/SourceReferences";

const pageSize = 12;
const sourceIcons = new Map<string, typeof File>([
  ["Email", Email],
  ["Deck", FilePresentation],
  ["Spreadsheet", FileSpreadsheet],
  ["Document", FileDocument],
  ["Transcript", FileDocument],
  ["Notes", FileDocument],
]);
const localOrigin = "https://workspace.invalid";
const sourceListPath = (engagementId: string, search = "") =>
  `/engagements/${encodeURIComponent(engagementId)}/sources${search}`;

function safeLocalUrl(path: unknown): URL | null {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    return null;
  }
  try {
    const url = new URL(path, localOrigin);
    return url.origin === localOrigin ? url : null;
  } catch {
    return null;
  }
}

function sourceSearch(search: string): string {
  const input = new URLSearchParams(search);
  const safe = new URLSearchParams();
  for (const key of ["q", "kind", "location"]) {
    const value = input.get(key);
    if (value && value.length <= 240) safe.set(key, value);
  }
  const page = input.get("page");
  if (page && /^\d{1,5}$/.test(page) && Number(page) > 1)
    safe.set("page", page);
  const query = safe.toString();
  return query ? `?${query}` : "";
}

function validSourceListPath(
  path: unknown,
  engagementId: string,
  fallbackSearch: string,
): string {
  const listPath = `/engagements/${encodeURIComponent(engagementId)}/sources`;
  const url = safeLocalUrl(path);
  if (!url || url.pathname !== listPath || url.hash)
    return sourceListPath(engagementId, sourceSearch(fallbackSearch));
  return sourceListPath(engagementId, sourceSearch(url.search));
}

function validReturnTo(
  candidate: SourceReturnContext | undefined,
  engagementId: string,
): SourceReturnContext | undefined {
  const url = safeLocalUrl(candidate?.path);
  if (!url || url.hash) return undefined;
  const base = `/engagements/${encodeURIComponent(engagementId)}`;
  if (url.search === "") {
    const workPrefix = `${base}/work/`;
    const stageSegment = url.pathname.startsWith(workPrefix)
      ? url.pathname.slice(workPrefix.length)
      : "";
    const stage = stages.find(
      (item) => encodeURIComponent(item.id) === stageSegment,
    );
    if (stage)
      return {
        path: `${base}/work/${stage.id}`,
        label: stage.name.toLowerCase(),
      };
  }
  if (url.pathname === `${base}/context`) {
    const query = [...url.searchParams.entries()];
    const stageIndex = Number(url.searchParams.get("stage"));
    if (
      query.length === 1 &&
      query[0]?.[0] === "stage" &&
      Number.isInteger(stageIndex) &&
      stageIndex >= 0 &&
      stageIndex < stages.length
    ) {
      return { path: `${base}/context?stage=${stageIndex}`, label: "context" };
    }
  }
  return undefined;
}

function setFilter(
  current: URLSearchParams,
  setSearchParams: (
    next: URLSearchParams,
    options?: { replace?: boolean },
  ) => void,
  key: string,
  value: string,
) {
  const next = new URLSearchParams(current);
  if (value) next.set(key, value);
  else next.delete(key);
  next.delete("page");
  setSearchParams(next, { replace: true });
}

function SourceActionForm({
  command,
  engagementId,
  revision,
  children,
}: {
  command: "load-client-files" | "load-folder";
  engagementId: string;
  revision: number;
  children: string;
}) {
  const fetcher = useFetcher<{ error?: string }>();

  return (
    <div>
      <fetcher.Form method="post" action="/">
        <input
          type="hidden"
          name="command"
          value={JSON.stringify({ type: command, engagementId })}
        />
        <input type="hidden" name="expectedRevision" value={revision} />
        <Button
          type="submit"
          color="secondary"
          variant="outline"
          size="sm"
          loading={fetcher.state === "submitting"}
          disabled={fetcher.state !== "idle"}
        >
          {children}
        </Button>
      </fetcher.Form>
      {fetcher.data?.error ? (
        <p className="mt-1 text-sm text-warning" role="alert">
          {fetcher.data.error}
        </p>
      ) : null}
    </div>
  );
}

export function SourceListPage() {
  const { engagement, workspace, clientLabel } = useEngagement();
  const { engagementId: routeEngagementId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const engagementId = routeEngagementId ?? engagement.id;
  const listState = (location.state ?? {}) as {
    selectedSourceId?: string;
    restoreScrollY?: number;
    listScrollKey?: string;
  };
  const restoreScrollY =
    Number.isFinite(listState.restoreScrollY) &&
    (listState.restoreScrollY ?? -1) >= 0
      ? listState.restoreScrollY
      : undefined;
  const returnScrollKey = listState.listScrollKey?.startsWith(
    `sources:${engagementId}:`,
  )
    ? listState.listScrollKey
    : undefined;

  useEffect(() => {
    if (typeof restoreScrollY !== "number") return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(
        0,
        Math.min(restoreScrollY, document.documentElement.scrollHeight),
      );
    });
    if (returnScrollKey) writeSessionValue(returnScrollKey, null);
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, restoreScrollY, returnScrollKey]);

  const listSearchParams = new URLSearchParams(
    sourceSearch(searchParams.toString()),
  );
  const sources = engagement.sources;
  const search = listSearchParams.get("q") ?? "";
  const kindFilter = listSearchParams.get("kind") ?? "";
  const locationFilter = listSearchParams.get("location") ?? "";

  const kinds = [...new Set(sources.map((source) => source.kind))].sort(
    (a, b) => a.localeCompare(b),
  );
  const locations = [
    ...new Set(
      sources.map((source) => source.folder ?? "Location not recorded"),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredSources = sources.filter((source) => {
    const location = source.folder ?? "Location not recorded";
    const matchesSearch =
      !normalizedSearch ||
      [
        source.title,
        source.filename,
        source.summary,
        source.body,
        source.by,
        source.kind,
        location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedSearch);

    return (
      matchesSearch &&
      (!kindFilter || source.kind === kindFilter) &&
      (!locationFilter || location === locationFilter)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filteredSources.length / pageSize));
  const requestedPage = Number.parseInt(
    listSearchParams.get("page") ?? "1",
    10,
  );
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const visibleSources = filteredSources.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const folderLoaded = sources.some((source) =>
    source.folder?.startsWith("Client handoff/"),
  );
  const queryString = listSearchParams.toString();
  const preservedSearch = queryString ? `?${queryString}` : "";
  const qualificationPath = `/engagements/${encodeURIComponent(engagementId)}/work/qualification`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl @3xl:text-2xl font-semibold tracking-tight">
            Sources
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Source material linked to {clientLabel}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {engagement.example && sources.length > 0 && !folderLoaded ? (
            <SourceActionForm
              command="load-folder"
              engagementId={engagementId}
              revision={workspace.revision}
            >
              Load folder inventory
            </SourceActionForm>
          ) : null}
        </div>
      </header>

      {sources.length === 0 ? (
        <EmptyMessage className="rounded-xl border border-default px-5 py-6">
          <EmptyMessage.Title>No sources loaded</EmptyMessage.Title>
          <EmptyMessage.Description>
            {engagement.example
              ? "Load the sample client files to make the intake material available in this engagement."
              : "Source material will appear here after it is added to this engagement."}
          </EmptyMessage.Description>
          <EmptyMessage.ActionRow>
            {engagement.example ? (
              <SourceActionForm
                command="load-client-files"
                engagementId={engagementId}
                revision={workspace.revision}
              >
                Load sample client files
              </SourceActionForm>
            ) : null}
            <TextLink as={Link} to={qualificationPath}>
              Open current work · Qualification
            </TextLink>
          </EmptyMessage.ActionRow>
        </EmptyMessage>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <label
              className="grid min-w-0 flex-[1_1_16rem] gap-1.5 text-sm font-medium"
              htmlFor="source-search"
            >
              Search sources
              <Input
                id="source-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setFilter(
                    listSearchParams,
                    setSearchParams,
                    "q",
                    event.currentTarget.value,
                  )
                }
                placeholder="Title, summary, author or file name"
                size="sm"
              />
            </label>
            <label
              className="grid min-w-0 flex-[1_1_8rem] gap-1.5 text-sm font-medium"
              htmlFor="source-kind"
            >
              Kind
              <Select
                id="source-kind"
                size="lg"
                value={kindFilter || "all"}
                options={[
                  { value: "all", label: "All kinds" },
                  ...kinds.map((kind) => ({ value: kind, label: kind })),
                ]}
                onChange={(option) =>
                  setFilter(
                    listSearchParams,
                    setSearchParams,
                    "kind",
                    option.value === "all" ? "" : option.value,
                  )
                }
              />
            </label>
            <label
              className="grid min-w-0 flex-[1_1_12rem] gap-1.5 text-sm font-medium"
              htmlFor="source-location"
            >
              Location
              <Select
                id="source-location"
                size="lg"
                value={locationFilter || "all"}
                options={[
                  { value: "all", label: "All locations" },
                  ...locations.map((value) => ({ value, label: value })),
                ]}
                onChange={(option) =>
                  setFilter(
                    listSearchParams,
                    setSearchParams,
                    "location",
                    option.value === "all" ? "" : option.value,
                  )
                }
              />
            </label>
          </div>

          <div className="mb-2 flex items-center justify-between gap-3 text-sm text-secondary">
            <p aria-live="polite">
              {filteredSources.length}{" "}
              {filteredSources.length === 1 ? "source" : "sources"}
            </p>
          </div>

          {filteredSources.length === 0 ? (
            <EmptyMessage className="rounded-xl border border-default px-5 py-6">
              <EmptyMessage.Title>No matching sources</EmptyMessage.Title>
              <EmptyMessage.Description>
                Change the search or filters to see more source material.
              </EmptyMessage.Description>
              <EmptyMessage.ActionRow>
                <Button
                  type="button"
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSearchParams(new URLSearchParams(), { replace: true })
                  }
                >
                  Clear filters
                </Button>
              </EmptyMessage.ActionRow>
            </EmptyMessage>
          ) : (
            <>
              <ul className="border-y border-default">
                {visibleSources.map((source) => (
                  <SourceListRow
                    key={source.id}
                    source={source}
                    engagementId={engagementId}
                    search={preservedSearch}
                    selected={source.id === listState.selectedSourceId}
                  />
                ))}
              </ul>
              <nav
                className="mt-4 flex items-center justify-between gap-3"
                aria-label="Source pages"
              >
                <Button
                  type="button"
                  color="secondary"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    const previous = new URLSearchParams(listSearchParams);
                    if (page <= 2) previous.delete("page");
                    else previous.set("page", String(page - 1));
                    setSearchParams(previous, { replace: true });
                  }}
                >
                  Previous
                </Button>
                <p className="text-sm text-secondary" aria-live="polite">
                  Page {page} of {pageCount}
                </p>
                <Button
                  type="button"
                  color="secondary"
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => {
                    const next = new URLSearchParams(listSearchParams);
                    next.set("page", String(page + 1));
                    setSearchParams(next, { replace: true });
                  }}
                >
                  Next
                </Button>
              </nav>
            </>
          )}
        </>
      )}
    </main>
  );
}

function SourceListRow({
  source,
  engagementId,
  search,
  selected,
}: {
  source: Source;
  engagementId: string;
  search: string;
  selected: boolean;
}) {
  const detailPath = `/engagements/${encodeURIComponent(engagementId)}/sources/${encodeURIComponent(source.id)}${search}`;
  const returnPath = sourceListPath(engagementId, search);
  const listScrollKey = `sources:${engagementId}:${search}`;
  const SourceIcon = sourceIcons.get(source.kind) ?? File;
  const location = source.folder ?? "Location not recorded";
  const summary =
    source.summary?.trim() ||
    source.body.trim().split(/\n\s*\n/)[0] ||
    "Inventory entry; content was not included.";

  return (
    <li
      className={`grid gap-1.5 border-b border-default py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 ${selected ? "-mx-2 rounded-md bg-primary-soft px-2" : ""}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <SourceIcon
          className="mt-0.5 size-5 shrink-0 text-secondary"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <TextLink
            as={Link}
            to={detailPath}
            state={{ engagementId, sourceListPath: returnPath, listScrollKey }}
            onClick={() =>
              writeSessionValue(listScrollKey, String(window.scrollY))
            }
            className="break-all font-medium"
          >
            {source.filename ?? source.title}
          </TextLink>
          <p className="mt-0.5 truncate text-sm text-secondary">{summary}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-secondary">
        <span>{source.kind}</span>
        <span aria-hidden="true">·</span>
        <span className="max-w-72 truncate" title={location}>
          {location}
        </span>
        {!source.available ? (
          <Badge color="warning" size="sm">
            Content unavailable
          </Badge>
        ) : null}
      </div>
    </li>
  );
}

interface SourceReturnState {
  sourceListPath?: string;
  listScrollKey?: string;
  returnTo?: { path: string; label: string };
}

export function SourceDetailPage() {
  const { engagement, clientLabel } = useEngagement();
  const { engagementId: routeEngagementId, sourceId = "" } = useParams();
  const location = useLocation();
  const navigationState = (location.state ?? {}) as SourceReturnState;
  const engagementId = routeEngagementId ?? engagement.id;
  const source = engagement.sources.find((item) => item.id === sourceId);
  const listPath = validSourceListPath(
    navigationState.sourceListPath,
    engagementId,
    location.search,
  );
  const listScrollKey = navigationState.listScrollKey?.startsWith(
    `sources:${engagementId}:`,
  )
    ? navigationState.listScrollKey
    : undefined;
  const storedScrollY =
    listScrollKey && typeof window !== "undefined"
      ? readSessionValue(listScrollKey)
      : null;
  const scrollY = storedScrollY === null ? Number.NaN : Number(storedScrollY);
  const listReturnState = {
    selectedSourceId: sourceId,
    ...(listScrollKey ? { listScrollKey } : {}),
    ...(Number.isFinite(scrollY) && scrollY >= 0
      ? { restoreScrollY: scrollY }
      : {}),
  };
  const returnTo = validReturnTo(navigationState.returnTo, engagementId);
  const filename = source?.filename ?? source?.title ?? sourceId;
  const contentAvailable = Boolean(
    source?.available &&
    (source.sections?.length || source.sheet || source.body.trim()),
  );

  useEffect(() => {
    const anchor = location.hash.slice(1);
    if (!anchor) return;
    const frame = window.requestAnimationFrame(() =>
      document.getElementById(anchor)?.scrollIntoView({ block: "start" }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, sourceId]);

  if (!source) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-6">
        <header className="mb-5">
          <TextLink as={Link} to={listPath} state={listReturnState}>
            ← Sources
          </TextLink>
          <h1 className="mt-3 text-xl @3xl:text-2xl font-semibold tracking-tight">
            Source unavailable
          </h1>
        </header>
        <EmptyMessage className="rounded-xl border border-default px-5 py-6">
          <EmptyMessage.Title>
            This source is not in the current engagement
          </EmptyMessage.Title>
          <EmptyMessage.Description>
            Return to Sources and open an item linked to {clientLabel}.
          </EmptyMessage.Description>
        </EmptyMessage>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-6">
      <div className="mb-5">
        <nav className="hidden sm:block" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-secondary">
            <li>
              <TextLink
                as={Link}
                to={`/engagements/${encodeURIComponent(engagementId)}/overview`}
              >
                {clientLabel}
              </TextLink>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <TextLink as={Link} to={listPath} state={listReturnState}>
                Sources
              </TextLink>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="min-w-0 break-all text-primary">
              {filename}
            </li>
          </ol>
        </nav>
        <div className="sm:hidden">
          <TextLink as={Link} to={listPath} state={listReturnState}>
            ← Sources
          </TextLink>
        </div>
        <header className="mt-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-all text-xl @3xl:text-2xl font-semibold tracking-tight">
                {source.title}
              </h1>
              {source.title !== filename ? (
                <p className="mt-1 break-all text-sm text-secondary">
                  {filename}
                </p>
              ) : null}
            </div>
            {!contentAvailable ? (
              <Badge color="warning">Content unavailable</Badge>
            ) : null}
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <div className="flex min-w-0 gap-1.5">
              <dt className="shrink-0 text-secondary">Type</dt>
              <dd className="min-w-0 break-words">{source.kind}</dd>
            </div>
            {source.by ? (
              <div className="flex min-w-0 gap-1.5">
                <dt className="shrink-0 text-secondary">From</dt>
                <dd className="min-w-0 break-words">{source.by}</dd>
              </div>
            ) : null}
            {source.date ? (
              <div className="flex min-w-0 gap-1.5">
                <dt className="shrink-0 text-secondary">Date</dt>
                <dd className="min-w-0 break-words">{source.date}</dd>
              </div>
            ) : null}
          </dl>
          <details className="mt-2 text-sm">
            <summary className="w-fit cursor-pointer py-3 text-secondary underline underline-offset-2">
              Source details
            </summary>
            <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
              {!source.by ? (
                <>
                  <dt className="text-secondary">Attribution</dt>
                  <dd>Not recorded</dd>
                </>
              ) : null}
              {!source.date ? (
                <>
                  <dt className="text-secondary">Source date</dt>
                  <dd>Not recorded</dd>
                </>
              ) : null}
              {source.folder ? (
                <>
                  <dt className="text-secondary">Location</dt>
                  <dd className="min-w-0 break-words">{source.folder}</dd>
                </>
              ) : null}
              {source.version ? (
                <>
                  <dt className="text-secondary">Source version</dt>
                  <dd className="min-w-0 break-words">{source.version}</dd>
                </>
              ) : null}
              <dt className="text-secondary">Record revision</dt>
              <dd>{source.revision}</dd>
            </dl>
          </details>
          <p className="mt-4 max-w-3xl text-sm leading-6">
            {source.summary || "No summary was provided for this source."}
          </p>
          {returnTo ? (
            <p className="mt-3 text-sm">
              <TextLink as={Link} to={returnTo.path}>
                Return to {returnTo.label}
              </TextLink>
            </p>
          ) : null}
        </header>
      </div>

      <article className="border-t border-default pt-5">
        {contentAvailable ? (
          <SourceContent source={source} />
        ) : (
          <p className="rounded-lg border border-default px-4 py-3 text-sm text-secondary">
            This source record includes inventory metadata only. The file
            contents were not included, so there is no passage to show.
          </p>
        )}
      </article>
    </main>
  );
}

function SourceContent({ source }: { source: Source }) {
  if (source.sections?.length) {
    return (
      <div className="space-y-5">
        {source.sections.map((section) => (
          <SourceSectionView key={section.ref} section={section} />
        ))}
      </div>
    );
  }

  if (source.sheet) {
    const sheet = source.sheet;
    const firstSheetRow = Number(/^[A-Z]+(\d+)/i.exec(sheet.range)?.[1] ?? "1");
    const finalColumn = columnLabel(sheet.columns.length);
    return (
      <div className="space-y-3">
        <div>
          <h2 className="font-medium">{sheet.name}</h2>
          <p className="text-sm text-secondary">Range {sheet.range}</p>
        </div>
        <div
          id={sourceAnchor(`${sheet.name} ${sheet.range}`)}
          className="scroll-mt-6 overflow-x-auto rounded-lg border border-default"
          role="region"
          aria-label={`${sheet.name} data`}
          tabIndex={0}
        >
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-primary-soft">
              <tr>
                {sheet.columns.map((column) => (
                  <th
                    className="whitespace-nowrap border-b border-default px-3 py-2 font-medium"
                    key={column}
                    scope="col"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row, rowIndex) => {
                const rowNumber = firstSheetRow + rowIndex + 1;
                return (
                  <tr
                    id={sourceAnchor(
                      `${sheet.name} A${rowNumber}:${finalColumn}${rowNumber}`,
                    )}
                    key={`${source.id}-${rowIndex}`}
                  >
                    {sheet.columns.map((_, columnIndex) => (
                      <td
                        className="whitespace-nowrap border-b border-default px-3 py-2 last:border-b-0"
                        key={columnIndex}
                      >
                        {row[columnIndex] ?? ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {source.note ? (
          <p className="text-sm leading-6 text-secondary">{source.note}</p>
        ) : null}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-6">{source.body}</p>;
}

function columnLabel(columnCount: number): string {
  let value = columnCount;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

function SourceSectionView({ section }: { section: SourceSection }) {
  return (
    <section id={sourceAnchor(section.ref)} className="scroll-mt-6">
      <h2 className="mb-2 font-medium">
        <a
          className="text-secondary no-underline hover:underline"
          href={`#${sourceAnchor(section.ref)}`}
        >
          <span className="sr-only">Link to </span>
          {section.ref}
        </a>
        {section.title ? <span className="ml-2">{section.title}</span> : null}
      </h2>
      <p className="whitespace-pre-wrap text-sm leading-6">{section.text}</p>
    </section>
  );
}
