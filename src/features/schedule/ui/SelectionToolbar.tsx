import { Grid2X2, PencilLine, Trash2, X } from "lucide-react";
import type { MouseEvent } from "react";

type Props = {
  selected: ReadonlySet<string>;
  disabled: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onTemplate: (event: MouseEvent<HTMLButtonElement>) => void;
  onClear: () => void;
  onDeselect: () => void;
};
export function SelectionToolbar({
  selected,
  disabled,
  canEdit,
  onEdit,
  onTemplate,
  onClear,
  onDeselect,
}: Props) {
  const employees = new Set<string>();
  const dates = new Set<string>();
  for (const key of selected) {
    const [employeeId, date] = key.split("/");
    employees.add(employeeId);
    dates.add(date);
  }
  return (
    <div
      className="selection-toolbar"
      role="toolbar"
      aria-label="Действия с выделенными ячейками"
    >
      <div className="selection-summary">
        <span>Выделено:</span>
        <span className="selection-count">{selected.size} ячеек</span>
        <span>
          {employees.size} сотрудника(-ов) · {dates.size} дн.
        </span>
      </div>
      <div className="selection-actions">
        <button disabled={disabled} onClick={onTemplate}>
          <Grid2X2 size={14} />
          Применить шаблон
        </button>
        {canEdit && (
          <button disabled={disabled} onClick={onEdit}>
            <PencilLine size={14} />
            Изменить
          </button>
        )}
        <button disabled={disabled} onClick={onClear}>
          <Trash2 size={14} />
          Очистить
        </button>
        <button disabled={disabled} onClick={onDeselect}>
          <X size={14} />
          Снять
        </button>
      </div>
    </div>
  );
}
