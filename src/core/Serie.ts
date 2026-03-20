import type { ISerie } from "../types/interfaces";
import type { MarkerType } from "../types/enums";
import { SymbolTypes } from "../types/enums";
import type { ResolvedOptions } from "./Options";

/**
 * Normalised representation of a single data series.
 *
 * Constructed from a raw {@link ISerie} definition plus the chart's resolved options.
 * All optional fields are given sensible defaults so downstream code never needs to
 * null-check them.
 */
export class Serie {
  /** Name of the Y axis this series is bound to (empty string = default axis). */
  public axis: string;
  /** Raw numeric data values. Empty array for range-only series. */
  public data: number[];
  /** d3 number-format string used for data labels and tooltips. */
  public format: string;
  /** Zero-based index of this series within the parent {@link Series} collection. */
  public index: number;
  /** Resolved marker shape for this series. */
  public marker: MarkerType;
  /** Display name used in the legend and tooltip. */
  public name: string;
  /** Upper-bound values for range (band) series. Empty array for plain series. */
  public max: number[];
  /** Lower-bound values for range (band) series. Empty array for plain series. */
  public min: number[];
  /** Bubble area values for scatter charts. Empty array otherwise. */
  public size: number[];
  /** Unit suffix appended after formatted values in tooltips. */
  public suffix: string;
  /** Sum of all `data` values (pre-computed for convenience). */
  public sum: number;
  /** Render type hint used by {@link ComboChart}: `"column"` or `"line"`. */
  public type: "column" | "line" | "";
  /** Whether this series is currently visible (toggled by legend clicks). */
  public visible: boolean;

  /**
   * @param options - Fully-resolved chart options.
   * @param serie   - Raw series definition from the consumer's data input.
   * @param index   - Zero-based position of this series in the series array.
   */
  public constructor(options: ResolvedOptions, serie: ISerie, index: number) {
    this.data    = serie.data  ?? [];
    this.max     = serie.max   ?? [];
    this.min     = serie.min   ?? [];
    this.size    = serie.size  ?? [];
    this.axis    = serie.axis  ?? "";
    this.format  = serie.format  ?? "";
    this.name    = serie.name    ?? "";
    this.suffix  = serie.suffix  ?? "";
    this.type    = serie.type ?? "";
    this.index   = index;
    this.visible = true;
    this.sum     = this.data.reduce((acc, v) => acc + v, 0);
    this.marker  = this._resolveMarker(serie, options, index);
  }

  /**
   * Returns the best display name for this series, falling back from
   * `name` → `axis` → a generated label (`"Serie N"`).
   */
  public getName(): string {
    if (this.name) {return this.name;}
    if (this.axis) {return this.axis;}
    return `Serie ${this.index + 1}`;
  }

  /**
   * Determines the marker shape for this series.
   *
   * Priority order:
   * 1. Per-series `marker` override on the raw `ISerie`.
   * 2. `"mixed"` global type → cycles through `SymbolTypes` by index.
   * 3. Global `plotOptions.markers.type`.
   */
  private _resolveMarker(serie: ISerie, options: ResolvedOptions, index: number): MarkerType {
    if (serie.marker) {return serie.marker;}
    if (options.plotOptions.markers.type === "mixed") {
      return SymbolTypes[index % SymbolTypes.length];
    }
    return options.plotOptions.markers.type;
  }
}
