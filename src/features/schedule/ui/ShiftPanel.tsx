import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { Plus } from "lucide-react";
import type { Template } from "../../../../shared/schedule";
import type { ShiftValue } from "../model/editor";
import { TemplateButton } from "./TemplateButton";

export type ShiftPanelHandle = { edit: (value: ShiftValue) => void };

type Props = {
  ref?: Ref<ShiftPanelHandle>;
  templates: Template[];
  hasSelection: boolean;
  saving: boolean;
  onAssign: (value: ShiftValue) => void;
};
export function ShiftPanel({
  ref,
  templates,
  hasSelection,
  saving,
  onAssign,
}: Props) {
  const startInput = useRef<HTMLInputElement>(null);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  useImperativeHandle(ref, () => ({
    edit(value) {
      setStart(value.start);
      setEnd(value.end);
      startInput.current?.focus();
      startInput.current?.scrollIntoView({ block: "nearest" });
    },
  }));
  return (
    <aside className="templates-panel">
      <h2>Шаблоны смен</h2>
      <div className="templates">
        {templates.map((template) => (
          <TemplateButton
            key={template.id}
            template={template}
            showShortcut
            disabled={saving}
            onAssign={onAssign}
          />
        ))}
      </div>
      <h2 className="custom-heading">Своя смена</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onAssign({ start, end, kind: "custom" });
        }}
      >
        <div className="time-fields">
          <label>
            Начало
            <input
              required
              ref={startInput}
              aria-label="Начало смены"
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              disabled={saving}
            />
          </label>
          <label>
            Конец
            <input
              required
              aria-label="Конец смены"
              type="time"
              value={end}
              onChange={(event) => {
                setEnd(event.target.value);
                event.target.setCustomValidity("");
              }}
              onInvalid={(event) =>
                event.currentTarget.setCustomValidity(
                  "Укажите время окончания смены",
                )
              }
              disabled={saving}
            />
          </label>
        </div>
        <button
          type="submit"
          className="secondary apply"
          disabled={!hasSelection || saving}
        >
          <Plus size={16} />
          Поставить в выделенные
        </button>
      </form>
    </aside>
  );
}
