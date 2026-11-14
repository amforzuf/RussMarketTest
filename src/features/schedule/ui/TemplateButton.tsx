import type { Template } from "../../../../shared/schedule";
import type { ShiftValue } from "../model/editor";
import { hours, templateShortcuts } from "../model/format";

type Props = {
  template: Template;
  showShortcut?: boolean;
  disabled?: boolean;
  onAssign: (value: ShiftValue) => void;
};
export function TemplateButton({ template, showShortcut, disabled, onAssign }: Props) {
  return (
    <button
      type="button"
      className={`template ${template.id}`}
      disabled={disabled}
      draggable={!disabled}
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({ template: template.id }),
        );
        event.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() =>
        onAssign({
          start: template.start,
          end: template.end,
          kind: template.id,
        })
      }
    >
      <span>{template.name}</span>
      {showShortcut && <kbd>{templateShortcuts[template.id]}</kbd>}
      <small>
        {template.start} – {template.end} ·{" "}
        {hours(template.start, template.end)}
      </small>
    </button>
  );
}
