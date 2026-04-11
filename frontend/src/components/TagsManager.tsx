import { useState } from "react";
import type { Tag, Language } from "../lib/cookies";
import t from "../i18n";

interface Props {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
  language?: Language;
}

export default function TagsManager({
  tags,
  onChange,
  language = "en",
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#7c3aed");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newTag: Tag = { id: `${Date.now()}`, name: trimmed, color };
    onChange([newTag, ...tags]);
    setName("");
  };

  const handleDelete = (id: string) => {
    onChange(tags.filter((t) => t.id !== id));
  };

  return (
    <div className="surface-muted flex flex-col sm:flex-row items-start sm:items-center gap-3 px-3 py-3">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("tagNamePlaceholder", language)}
          className="rounded px-2 py-1 text-sm flex-1 w-full"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-9 h-9 p-0 ml-2"
          aria-label={t("colorPicker", language)}
        />
        <button
          onClick={handleAdd}
          className="action-button w-full sm:w-auto ml-2"
        >
          {t("addTag", language)}
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {tags.slice(0, 6).map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2 rounded px-2 py-1 border flex-shrink-0"
          >
            <span
              style={{ background: tag.color }}
              className="w-3 h-3 inline-block rounded-full border border-slate-200 dark:border-white/10"
            />
            <span className="text-xs">{tag.name}</span>
            <button
              onClick={() => handleDelete(tag.id)}
              className="ml-2 text-xs text-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
