import type { IDatum, ISerie } from "../types/interfaces";
import { StackType } from "../types/enums";
import type { ResolvedOptions } from "./Options";
import { Serie } from "./Serie";

/**
 * Manages the complete collection of data series for a chart.
 *
 * Responsibilities:
 * - Wraps each raw {@link ISerie} in a normalised {@link Serie} instance.
 * - Builds a 2-D data matrix of {@link IDatum} objects, computing stacking
 *   metadata (`sum`, `perc`, `y0`, `y1`) for every cell.
 * - Exposes `min()` / `max()` helpers that respect the current stack type
 *   and optional axis name filter — used by axes to size their scales.
 */
export class Series {
  /** Ordered array of normalised series. */
  public items: Serie[];
  /** Number of series. */
  public length: number;

  /** Row-major matrix: `_matrix[seriesIndex][categoryIndex]`. */
  private readonly _matrix: IDatum[][];

  /**
   * @param seriesData - Raw series definitions from the chart input data.
   * @param options    - Fully-resolved chart options.
   * @param stackType  - How to combine series values (none / normal / percent).
   */
  public constructor(seriesData: ISerie[], options: ResolvedOptions, stackType: StackType) {
    this.items  = seriesData.map((s, i) => new Serie(options, s, i));
    this.length = this.items.length;
    this._matrix = this._buildMatrix(stackType);
  }

  /**
   * Returns the datum row for a given series index.
   * @param i - Zero-based series index.
   */
  public getMatrixItem(i: number): IDatum[] {
    return this._matrix[i];
  }

  /**
   * Returns the datum rows for all series bound to a named axis.
   * @param name - Axis name to filter by (matches `Serie.axis`).
   */
  public getMatricesByAxis(name: string): IDatum[][] {
    return this.items
      .map((_, i) => ({ axis: this.items[i].axis, matrix: this._matrix[i] }))
      .filter(({ axis }) => axis === name)
      .map(({ matrix }) => matrix);
  }

  /**
   * Returns the display label for a single series.
   * @param i - Zero-based series index.
   */
  public getLabel(i: number): string {
    return this.items[i].getName();
  }

  /** Returns display labels for all series, in order. */
  public getLabels(): string[] {
    return this.items.map((s) => s.getName());
  }

  /**
   * Returns the maximum data value across all series (or a named-axis subset).
   *
   * - For stacked charts: the maximum column total (`d.sum`).
   * - For non-stacked charts: the maximum of `y` and `y1` (supports range series).
   *
   * @param axisName  - Optional axis name to restrict the calculation.
   * @param stackType - Stack mode that determines which field to inspect.
   */
  public max(axisName?: string, stackType: StackType = StackType.None): number {
    const matrix = this._getMatrix(axisName, stackType);

    if (stackType !== StackType.None && this.items.length > 1) {
      return Math.max(...matrix.map((row) => Math.max(...row.map((d) => d.sum))));
    }
    return Math.max(...matrix.map((row) => Math.max(...row.map((d) => (d.y > d.y1 ? d.y : d.y1)))));
  }

  /**
   * Returns the minimum data value across all series (or a named-axis subset).
   *
   * - For stacked charts: the minimum running total including negative stacks.
   * - For non-stacked charts: the minimum of `y` and `y0` (supports range series).
   *
   * @param axisName  - Optional axis name to restrict the calculation.
   * @param stackType - Stack mode that determines which field to inspect.
   */
  public min(axisName?: string, stackType: StackType = StackType.None): number {
    const matrix = this._getMatrix(axisName, stackType);

    if (stackType !== StackType.None && this.items.length > 1) {
      return Math.min(...matrix.map((row) => Math.min(...row.map((d) => d.sum + d.y))));
    }
    return Math.min(...matrix.map((row) => Math.min(...row.map((d) => (d.y < d.y0 ? d.y : d.y0)))));
  }

  /**
   * Selects the matrix rows to use for min/max calculations.
   * When an `axisName` is given and stack type is `None`, only series bound
   * to that axis are included; otherwise the full matrix is used.
   */
  private _getMatrix(axisName: string | undefined, stackType: StackType): IDatum[][] {
    if (axisName && axisName !== "" && stackType === StackType.None) {
      const filtered = this.getMatricesByAxis(axisName);
      if (filtered.length > 0) {return filtered;}
    }
    return this._matrix;
  }

  /**
   * Builds the complete datum matrix from the raw series data.
   *
   * Steps:
   * 1. `_initRaw()`   — extracts plain number arrays (or NaN placeholders for range series).
   * 2. `_mapToDatum()` — converts numbers to `IDatum` objects, populating `y0`/`y1`.
   * 3. Transposes to column-major order, then computes `sum`, `perc`, and (for
   *    `StackType.Percent`) rescaled `y0`/`y1` values column by column.
   * 4. Transposes back to row-major order.
   *
   * @param stackType - Determines how `sum` and percent values are calculated.
   */
  private _buildMatrix(stackType: StackType): IDatum[][] {
    const rawMatrix = this._initRaw();
    const mapped    = this._mapToDatum(rawMatrix);
    const transposed = this._transpose(mapped);

    transposed.forEach((col) => {
      let posBase = 0;
      let negBase = 0;
      const sum   = col.reduce((acc, d) => acc + (Number.isFinite(d.y) ? Math.abs(d.y) : 0), 0);

      col.forEach((d) => {
        d.max  = sum;
        d.perc = sum !== 0 && Number.isFinite(d.y) ? d.y / sum : 0;
        if (!Number.isFinite(d.y)) {
          d.sum = posBase;
        } else if (d.y < 0) {
          d.sum  = negBase;
          negBase -= Math.abs(d.y);
        } else {
          posBase += Math.abs(d.y);
          d.sum    = posBase;
        }
      });

      // For percent stacking: rescale y values
      if (stackType === StackType.Percent && sum !== 0) {
        let runningPos = 0;
        let runningNeg = 0;
        col.forEach((d) => {
          const pct = d.y / sum;
          if (d.y >= 0) {
            d.y0  = runningPos;
            runningPos += pct;
            d.y1  = runningPos;
            d.sum = runningPos;
          } else {
            d.y1  = runningNeg;
            runningNeg += pct; // pct is negative
            d.y0  = runningNeg;
            d.sum = runningNeg;
          }
        });
      }
    });

    return this._transpose(transposed);
  }

  /**
   * Returns one number array per series.
   * Plain series return their `data` array directly.
   * Range series (min/max only) return an array of `NaN` placeholders of the correct length.
   */
  private _initRaw(): number[][] {
    return this.items.map((serie) => {
      if (serie.data.length > 0) {return serie.data;}
      const len = Math.max(serie.min.length, serie.max.length);
      return Array.from({ length: len }, () => NaN);
    });
  }

  /**
   * Maps each raw number to an {@link IDatum}.
   * `y0` is taken from `serie.min[j]` when available (range series), otherwise `0`.
   * `y1` is taken from `serie.max[j]` when available, otherwise equals `y`.
   */
  private _mapToDatum(rawMatrix: number[][]): IDatum[][] {
    return rawMatrix.map((data, i) =>
      data.map((d, j) => ({
        max:  0,
        perc: 0,
        sum:  0,
        y:    d === null || d === undefined ? NaN : d,
        y0:   this.items[i].min[j] !== undefined ? this.items[i].min[j] : 0,
        y1:   this.items[i].max[j] !== undefined ? this.items[i].max[j] : (Number.isFinite(d) ? d : 0)
      }))
    );
  }

  /** Transposes a 2-D matrix (rows ↔ columns). */
  private _transpose(matrix: IDatum[][]): IDatum[][] {
    if (matrix.length === 0) {return [];}
    return matrix[0].map((_, col) => matrix.map((row) => row[col]));
  }
}
