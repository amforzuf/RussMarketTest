import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
import type { Template } from "../../../../shared/schedule";
import type { ShiftValue } from "../model/editor";
import { TemplateButton } from "./TemplateButton";
import type { MenuPosition } from "../model/format";
type Props = {
  position: MenuPosition;
  templates: Template[];
  onAssign: (value: ShiftValue) => void;
  onRemove: () => void;
  onClose: () => void;
};
export function ShiftMenu({
  position,
  templates,
  onAssign,
  onRemove,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="shift-menu"
      role="dialog"
      aria-label="Выбор смены"
      style={{ left: position.x, top: position.y }}
    >
      <div className="menu-heading">
        <span>{position.title}</span>
        <button aria-label="Закрыть выбор смены" onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      {templates.map((template) => (
        <TemplateButton
          key={template.id}
          template={template}
          onAssign={onAssign}
        />
      ))}
      <button className="delete-action" onClick={onRemove}>
        <Trash2 size={15} />
        Удалить смены
      </button>
    </div>
  );
}
