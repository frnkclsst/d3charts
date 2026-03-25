import type { IChartData, ISerie } from "../types/interfaces";

const PREFIX = "[d3charts]";

/** Returns the best display name for a raw series definition. */
function _serieName(serie: ISerie, index: number): string {
  if (serie.name) { return serie.name; }
  if (serie.axis) { return serie.axis; }
  return `Serie ${index + 1}`;
}

/**
 * Validates the chart input data and emits `console.warn` messages for any
 * detectable problems.
 *
 * Never throws — charts are designed to degrade gracefully. Warnings are
 * intended to be visible in the browser's developer console (F12) to help
 * the caller diagnose unexpected blank or partial renders.
 *
 * Checks performed:
 * - No series provided.
 * - Empty categories array.
 * - A series has no `data`, `min`, or `max` values.
 * - `data.length` does not match `categories.length`.
 * - Range series `min.length` does not match `max.length`.
 * - Range series length does not match `categories.length`.
 * - `data` contains `null`, `undefined`, or `NaN` values (rendered as gaps).
 */
export function validateData(data: IChartData): void {
  const catLen = data.categories?.data?.length ?? 0;

  if (!data.series || data.series.length === 0) {
    console.warn(`${PREFIX} No series provided — chart will render empty.`);
    return;
  }

  if (catLen === 0) {
    console.warn(`${PREFIX} Categories array is empty — chart will render empty.`);
    return;
  }

  for (let i = 0; i < data.series.length; i++) {
    const s       = data.series[i];
    const name    = _serieName(s, i);
    const dataLen = s.data?.length ?? 0;
    const minLen  = s.min?.length  ?? 0;
    const maxLen  = s.max?.length  ?? 0;

    if (dataLen === 0 && minLen === 0 && maxLen === 0) {
      console.warn(`${PREFIX} Series "${name}" has no data, min, or max values.`);
      continue;
    }

    if (dataLen > 0 && dataLen !== catLen) {
      console.warn(`${PREFIX} Series "${name}": data length (${dataLen}) does not match categories length (${catLen}).`);
    }

    if (minLen > 0 && maxLen > 0 && minLen !== maxLen) {
      console.warn(`${PREFIX} Series "${name}": min length (${minLen}) does not match max length (${maxLen}).`);
    }

    if (minLen > 0 && minLen !== catLen) {
      console.warn(`${PREFIX} Series "${name}": range data length (${minLen}) does not match categories length (${catLen}).`);
    }

    if (dataLen > 0) {
      const badIndices = (s.data as unknown[])
        .map((v, j) => ({ v, j }))
        .filter(({ v }) => v === null || v === undefined || (typeof v === "number" && isNaN(v)))
        .map(({ j }) => j);

      if (badIndices.length > 0) {
        console.warn(
          `${PREFIX} Series "${name}": data contains ${badIndices.length} null/undefined/NaN value(s) at index [${badIndices.join(", ")}] — will be rendered as a gap.`
        );
      }
    }
  }
}
