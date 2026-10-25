/**
 * Tableaux markdown pour le rendu ligne à ligne du blog (blog/[slug]/page.tsx).
 *
 * Le moteur du blog transforme chaque ligne isolément ; un tableau, lui,
 * s'étale sur plusieurs lignes. `renderTableAt` est appelé sur la première
 * ligne « | … | » d'un bloc : il lit le bloc entier et rend le <table> ; les
 * lignes suivantes du bloc sont ignorées par l'appelant (`isTableContinuation`).
 * La 1re ligne est l'en-tête, la ligne « |---|---| » est sautée.
 */

const isRow = (line: string | undefined) => !!line && line.trimStart().startsWith("|");
const isSeparator = (line: string) => /^\s*\|[\s:|-]+\|\s*$/.test(line);
const cells = (line: string) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

export const isTableRow = isRow;

export const isTableContinuation = (lines: string[], i: number) => isRow(lines[i]) && isRow(lines[i - 1]);

export function renderTableAt(lines: string[], start: number, inline: (s: string) => string): string {
  const block: string[] = [];
  for (let i = start; isRow(lines[i]); i++) if (!isSeparator(lines[i])) block.push(lines[i]);
  const [head, ...body] = block;
  const th = cells(head)
    .map((c) => `<th class="px-4 py-3 text-left font-semibold text-gray-900">${inline(c)}</th>`)
    .join("");
  const rows = body
    .map(
      (r) =>
        `<tr class="border-t border-gray-200">${cells(r)
          .map((c, j) => `<td class="px-4 py-3 align-top ${j === 0 ? "font-semibold text-gray-900" : "text-gray-600"}">${inline(c)}</td>`)
          .join("")}</tr>`
    )
    .join("");
  return `<div class="my-8 overflow-x-auto rounded-xl border border-gray-200"><table class="w-full min-w-[640px] text-sm"><thead class="bg-gray-50"><tr>${th}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
