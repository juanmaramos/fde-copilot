import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import type { CheckResult } from "../../domain/types";

export function EvidenceStatus({
  result,
  reviewed,
}: {
  result: CheckResult | "missing";
  reviewed: boolean;
}) {
  if (result === "fail") return <Badge color="danger">Failed</Badge>;
  if (result === "pending") return <Badge color="warning">Pending</Badge>;
  if (result === "missing") return <Badge color="warning">No evidence</Badge>;
  return (
    <Badge color={reviewed ? "success" : "secondary"}>
      {reviewed ? "Confirmed" : "Supported"}
    </Badge>
  );
}
