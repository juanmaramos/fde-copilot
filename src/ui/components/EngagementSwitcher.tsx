import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Eye, EyeOff } from "@openai/apps-sdk-ui/components/Icon";
import { Select } from "@openai/apps-sdk-ui/components/Select";
import { Tooltip } from "@openai/apps-sdk-ui/components/Tooltip";
import { useId } from "react";

export interface EngagementSwitcherItem {
  id: string;
  label: string;
}

export interface EngagementSwitcherProps {
  items: EngagementSwitcherItem[];
  activeId: string;
  onSelect: (id: string) => void;
  hideNames: boolean;
  onHideNamesChange: (value: boolean) => void;
}

const searchVisibleLabel = (option: { label: string }, searchTerm: string) =>
  option.label
    .toLocaleLowerCase()
    .includes(searchTerm.trim().toLocaleLowerCase());

export function EngagementSwitcher({
  items,
  activeId,
  onSelect,
  hideNames,
  onHideNamesChange,
}: EngagementSwitcherProps) {
  const labelId = useId();
  const selectId = useId();
  const options = items.map(({ id, label }) => ({ value: id, label }));
  const VisibilityIcon = hideNames ? Eye : EyeOff;
  const visibilityAction = hideNames
    ? "Show client names"
    : "Hide client names";

  return (
    <div
      className="flex min-w-0 items-center gap-1"
      role="group"
      aria-labelledby={labelId}
    >
      <span className="sr-only" id={labelId}>
        Engagement
      </span>
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={selectId}>
          Choose engagement
        </label>
        <Select
          id={selectId}
          options={options}
          value={activeId}
          onChange={(option) => onSelect(option.value)}
          searchPredicate={searchVisibleLabel}
          searchPlaceholder="Search engagements"
          align="start"
          listMaxWidth={320}
          size="sm"
          block
          triggerClassName="w-full min-w-0"
        />
      </div>
      <Tooltip
        content="Hides names in navigation. Source content is still visible."
        maxWidth={240}
      >
        <Button
          type="button"
          color="secondary"
          variant="ghost"
          size="sm"
          uniform
          aria-label={visibilityAction}
          onClick={() => onHideNamesChange(!hideNames)}
        >
          <VisibilityIcon aria-hidden="true" />
        </Button>
      </Tooltip>
    </div>
  );
}
