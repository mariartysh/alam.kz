import katex from "katex";
import { splitMath } from "@/lib/richtext";

/** Текст с формулами `$...$`. Обычный текст экранирует React, формулы рендерит KaTeX. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {splitMath(text).map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span
            key={i}
            className={seg.display ? "my-2 block overflow-x-auto" : undefined}
            dangerouslySetInnerHTML={{ __html: katex.renderToString(seg.value, { throwOnError: false, displayMode: seg.display }) }}
          />
        ),
      )}
    </span>
  );
}
