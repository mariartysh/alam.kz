/** Разбивает текст на обычные куски и формулы `$...$` (inline) / `$$...$$` (блочные). */
export type Segment =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string; display: boolean };

export function splitMath(input: string): Segment[] {
  const out: Segment[] = [];
  const re = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let last = 0;
  for (let m = re.exec(input); m; m = re.exec(input)) {
    if (m.index > last) out.push({ kind: "text", value: input.slice(last, m.index) });
    out.push(m[1] !== undefined
      ? { kind: "math", value: m[1], display: true }
      : { kind: "math", value: m[2], display: false });
    last = re.lastIndex;
  }
  if (last < input.length) out.push({ kind: "text", value: input.slice(last) });
  return out;
}
