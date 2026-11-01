import { TextLink } from "@openai/apps-sdk-ui/components/TextLink";
import { Link } from "react-router";

export interface SourceReference {
  id: string;
  anchor?: string;
  label?: string;
}

export interface SourceReturnContext {
  path: string;
  label: string;
}

export function sourceAnchor(ref: string): string {
  const slug = ref
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `source-${slug || "passage"}`;
}

interface SourceReferencesProps {
  engagementId: string;
  references: SourceReference[];
  returnTo?: SourceReturnContext;
}

export function SourceReferences({
  engagementId,
  references,
  returnTo,
}: SourceReferencesProps) {
  if (references.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
      {references.flatMap((reference, index) =>
        expandReference(reference).map((expanded, rangeIndex) => {
          const hash = expanded.anchor
            ? `#${sourceAnchor(expanded.anchor)}`
            : "";
          const label =
            expanded.label ??
            [expanded.id, expanded.anchor].filter(Boolean).join(" · ");

          return (
            <li
              key={`${expanded.id}-${expanded.anchor ?? index}-${rangeIndex}`}
            >
              <TextLink
                as={Link}
                to={`/engagements/${encodeURIComponent(engagementId)}/sources/${encodeURIComponent(expanded.id)}${hash}`}
                state={{ engagementId, ...(returnTo ? { returnTo } : {}) }}
              >
                {label}
              </TextLink>
            </li>
          );
        }),
      )}
    </ul>
  );
}

function expandReference(reference: SourceReference): SourceReference[] {
  if (!reference.anchor) return [reference];

  const match =
    /^(.*?)\s+([A-Z]+\d+:[A-Z]+\d+(?:\s+and\s+[A-Z]+\d+:[A-Z]+\d+)*)$/i.exec(
      reference.anchor,
    );
  const ranges = match?.[2].match(/[A-Z]+\d+:[A-Z]+\d+/gi);
  if (!match || !ranges || ranges.length < 2) return [reference];

  return ranges.map((range) => ({
    ...reference,
    anchor: `${match[1]} ${range}`,
    label: `${reference.label ?? reference.id} · ${match[1]} ${range}`,
  }));
}
