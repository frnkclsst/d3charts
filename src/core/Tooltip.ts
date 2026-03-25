import * as d3 from "d3";
import type { IDatum } from "../types/interfaces";
import type { GSelection } from "./ChartArea";
import type { Series } from "./Series";
import type { Categories } from "./Categories";
import type { ColorPalette } from "./ColorPalette";
import type { ResolvedTooltipOptions } from "./Options";

/**
 * Callback that extracts the tooltip row content from a datum.
 *
 * @param datum   - The raw datum bound to the hovered element.
 * @param index   - Its position in the series data array.
 * @param allData - The full data array for the series (useful for computing totals).
 * @returns `value` — formatted value string; `percent` — percentage string (may be empty);
 *          `colorIndex` — index into the colour palette for the swatch.
 */
export type TooltipExtractor = (
  datum: unknown,
  index: number,
  allData: unknown[],
) => { value: string; percent: string; colorIndex: number; color?: string };

/**
 * Manages hover tooltips for chart data points.
 *
 * Each shape that wants a tooltip calls {@link attach}, passing its D3 selection and
 * the series index. `Tooltip` then appends an absolutely-positioned `<div>` to the
 * chart container and wires up `mouseover` / `mousemove` / `mouseout` events on the
 * shape selection.
 *
 * Tooltip HTML structure:
 * ```
 * <div class="d3charts-tooltip">
 *   <div class="title">…</div>
 *   <div class="subtitle">…</div>   <!-- category label -->
 *   <div class="items">
 *     <div class="item">
 *       <span class="color" />
 *       <span class="serie">…</span>
 *       <span class="value">…</span>
 *       <span class="percent">…</span>
 *     </div>
 *   </div>
 * </div>
 * ```
 */
export class Tooltip {
  private readonly _selector: string;
  private readonly _series: Series;
  private readonly _categories: Categories;
  private readonly _palette: ColorPalette;
  private readonly _opts: ResolvedTooltipOptions;

  /**
   * @param selector   - CSS selector of the chart container element.
   * @param series     - The chart's series collection (used for labels and formatting).
   * @param categories - The chart's categories (used for the tooltip subtitle).
   * @param palette    - Color palette (used for the colour swatch).
   * @param opts       - Resolved tooltip options.
   */
  public constructor(
    selector: string,
    series: Series,
    categories: Categories,
    palette: ColorPalette,
    opts: ResolvedTooltipOptions
  ) {
    this._selector   = selector;
    this._series     = series;
    this._categories = categories;
    this._palette    = palette;
    this._opts       = opts;
  }

  /**
   * Attaches tooltip behaviour to a D3 selection of SVG elements.
   *
   * A single `<div class="d3charts-tooltip">` is appended to the chart container
   * and wired to `mouseover` / `mousemove` / `mouseout` events on `svg`.
   *
   * **Default behaviour** (Cartesian charts): datum is treated as {@link IDatum};
   * value is formatted via `_formatDataPoint`, percent is read from `datum.perc`.
   *
   * **Custom behaviour**: pass a {@link TooltipExtractor} as the third argument to
   * override how `value`, `percent`, and `colorIndex` are derived from each datum.
   * This is how pie/donut charts attach tooltips without needing a separate method.
   *
   * For backwards compatibility the third argument may also be a plain `number`
   * acting as a fixed `colorIndex` override (as used by {@link ScatterChart}).
   *
   * @param svg        - D3 selection of the data-bound SVG elements.
   * @param serieIndex - Zero-based series index (for label and default formatting).
   * @param extractor  - Optional extractor callback **or** a fixed colour-index number.
   */
  public attach(
    svg: GSelection,
    serieIndex: number,
    extractor?: TooltipExtractor | number
  ): void {
    // Normalise the third argument into a TooltipExtractor.
    const extract: TooltipExtractor = typeof extractor === "function"
      ? extractor
      : (datum, _i, _all): { value: string; percent: string; colorIndex: number } => {
          const d          = datum as IDatum;
          const colorIndex = typeof extractor === "number" ? extractor : serieIndex;
          return {
            value:      this._formatDataPoint(d, serieIndex),
            percent:    isNaN(d.perc) ? "" : `${Math.round(d.perc * 100)}%`,
            colorIndex
          };
        };

    const container = d3.select(this._selector);

    const div = container
      .append("div")
      .attr("class", "d3charts-tooltip")
      .style("opacity", "0")
      .style("position", "absolute")
      .style("pointer-events", "none");

    svg
      .on("mouseover", (event: MouseEvent, datum: unknown) => {
        const allData = svg.data();
        const i       = allData.indexOf(datum);
        const { value, percent, colorIndex, color } = extract(datum, i, allData);
        const swatchColor = color ?? this._palette.color(colorIndex);

        div.html(
          `<div class="title">${this._opts.title}</div>` +
          `<div class="subtitle">${this._categories.getItem(i)}</div>` +
          "<div class=\"items\"><div class=\"item\">" +
          `<span class="color" style="background:${swatchColor}"></span>` +
          `<span class="serie">${this._series.getLabel(serieIndex)}</span>` +
          `<span class="value">${value}</span>` +
          `<span class="percent">${percent}</span>` +
          "</div></div>"
        );

        div.transition().delay(300).duration(100).style("opacity", "1");
        const [px, py] = d3.pointer(event, (d3.select(this._selector).node() as Element));
        div.style("left", `${px - 50}px`).style("top", `${py + 10}px`);
      })
      .on("mouseout", () => {
        div.transition().duration(100).style("opacity", "0");
      })
      .on("mousemove", (event: MouseEvent) => {
        const [px, py] = d3.pointer(event, (d3.select(this._selector).node() as Element));
        div.style("left", `${px - 50}px`).style("top", `${py + 10}px`);
      });
  }

  /**
   * Formats a single datum value for display in the tooltip.
   *
   * Exposed publicly so chart subclasses (e.g. {@link VariwideChart}) can use
   * the same formatting logic inside a custom {@link TooltipExtractor} while
   * overriding only the `colorIndex`.
   *
   * Format priority: `tooltip.valuePointFormat` → `serie.format` → `String`.
   * Suffix priority: `tooltip.valueSuffix`      → `serie.suffix`.
   *
   * - Plain datum (`y === y1`): returns `"<value><suffix>"`.
   * - Range datum with `NaN` y: returns `"<y0><suffix> – <y1><suffix>"`.
   * - Range datum with explicit y: returns `"<y><suffix> (<y0><suffix> – <y1><suffix>)"`.
   */
  public formatValue(d: IDatum, serieIndex: number): string {
    return this._formatDataPoint(d, serieIndex);
  }

  private _formatDataPoint(d: IDatum, serieIndex: number): string {
    const fmt    = this._opts.valuePointFormat || this._series.items[serieIndex].format || "";
    const suffix = this._opts.valueSuffix      || this._series.items[serieIndex].suffix || "";
    const f      = fmt ? d3.format(fmt) : String;

    if (d.y === d.y1) {
      return `${f(d.y)}${suffix}`;
    }
    if (isNaN(d.y)) {
      return `${f(d.y0)}${suffix} – ${f(d.y1)}${suffix}`;
    }
    return `${f(d.y)}${suffix} (${f(d.y0)}${suffix} – ${f(d.y1)}${suffix})`;
  }
}
