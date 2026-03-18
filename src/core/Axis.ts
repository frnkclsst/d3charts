import * as d3 from "d3";
import { AxisType, GridLineType, ScaleType } from "../types/enums";
import type { OrientationType } from "../types/enums";
import type { ResolvedAxisOptions } from "./Options";
import { getHeight, getWidth } from "../utils/dom";
import { align } from "../utils/dom";

/** Union of all d3 scale types used in Cartesian charts. */
export type ChartScale =
  | d3.ScaleBand<string>
  | d3.ScaleLinear<number, number>
  | d3.ScaleTime<number, number>;

/** A generic d3 axis function (bottom, top, left, or right). */
export type AxisFn = d3.Axis<d3.AxisDomain>;

/**
 * Context object passed to axis methods during the two-pass draw cycle.
 *
 * Avoids a circular import between `Axis` and `CartesianChart` by using callbacks
 * rather than a direct reference to the chart instance.
 */
export interface IAxisContext {
  /** The plot area being drawn into. */
  plotArea: {
    width: number;
    height: number;
    axisSize: { left: number; right: number; top: number; bottom: number };
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  };
  /** Returns the X scale appropriate for `axis`. Called by {@link XAxis._getScale}. */
  getXScale(axis: Axis): ChartScale;
  /** Returns the Y scale appropriate for `axis`. Called by {@link YAxis._getScale}. */
  getYScale(axis: Axis): ChartScale;
  /** Returns the minimum series value, optionally filtered to a named axis. */
  seriesMin(axisName?: string): number;
}

/**
 * Base class for chart axes. Concrete implementations are {@link XAxis} and {@link YAxis}.
 *
 * Drawing happens in two passes, both driven by {@link CartesianChart.draw}:
 *
 * 1. **`setSize(ctx)`** — builds the scale, creates the axis `<g>`, calls d3's axis
 *    function to render tick labels, measures the rendered size, and shrinks the
 *    plot area via `_adjustPlotArea()`.
 *
 * 2. **`draw(ctx)`** — re-computes the scale with the now-final plot-area dimensions,
 *    repositions the axis group, and appends gridlines and a zero line.
 */
export class Axis {
  /** Rendered height of the axis group (px). Set during `setSize()`. */
  public height: number = 0;
  /**
   * When `true`, a zero-line is drawn if the series minimum is negative.
   * Typically `true` for the axis that carries the data values.
   */
  public isDataAxis: boolean = false;
  /** Axis name — matches `ISerie.axis` to bind series to this axis. */
  public name: string;
  /** The d3 scale built during `setSize()` and re-built during `draw()`. */
  public scale!: ChartScale;
  /** Whether this axis is horizontal (X) or vertical (Y). */
  public type: AxisType;
  /** Rendered width of the axis group (px). Set during `setSize()`. */
  public width: number = 0;
  /** Tick-label formatting configuration. */
  public readonly labels: { format: string; rotate: number };
  /** Axis title configuration. */
  public readonly title: { align: string; text: string; valign: string };

  protected _orient: OrientationType;
  protected _gridlineType: GridLineType;
  protected _hasTickmarks: boolean;
  protected _scaleType: ScaleType = ScaleType.Linear;
  protected _axisFn!: AxisFn;
  protected _svgAxis!: d3.Selection<SVGGElement, unknown, SVGElement, unknown>;
  /**
   * The rotation angle actually applied to tick labels (degrees).
   * Equals `labels.rotate` when set explicitly, or is set by auto-rotation in {@link XAxis}.
   * Used by `draw()` to re-apply alignment after d3 re-renders the axis in pass 2.
   */
  protected _effectiveRotation: number = 0;
  /**
   * The tick-thinning step computed during `setSize()`.
   * A value of N means only every Nth tick label is shown.
   * 1 = show all labels.
   */
  protected _tickStep: number = 1;

  /**
   * @param type    - Whether this is an X or Y axis.
   * @param options - Resolved axis options produced by {@link resolveOptions}.
   */
  public constructor(type: AxisType, options: ResolvedAxisOptions) {
    this.type          = type;
    this.name          = options.name;
    this.labels        = { ...options.labels };
    this.title         = { ...options.title };
    this._hasTickmarks = options.tickmarks;
    this._orient       = this._defaultOrient(type, options.orient);
    this._gridlineType = options.gridlines;
  }

  /** Returns the scale type currently assigned to this axis. */
  public getScaleType(): ScaleType { return this._scaleType; }

  /** Sets the scale type (called by the chart when building the scale). */
  public setScaleType(v: ScaleType): void { this._scaleType = v; }

  /**
   * **Pass 1** — Builds the scale, renders the axis into a temporary `<g>`, measures it,
   * and adjusts the plot area to reserve space for this axis.
   *
   * Also applies tick-label formatting and rotation at this stage.
   *
   * @param ctx - Axis rendering context from {@link CartesianChart}.
   */
  public setSize(ctx: IAxisContext): void {
    this.scale  = this._getScale(ctx);
    this._axisFn = this._buildAxisFn();

    if (this.labels.format) {
      const fmt = this._scaleType === ScaleType.Time
        ? d3.timeFormat(this.labels.format)
        : d3.format(this.labels.format);
      this._axisFn.tickFormat(fmt as (d: d3.AxisDomain) => string);
    }
    if (!this._hasTickmarks) {
      this._axisFn.tickSize(0).tickPadding(12);
    }

    this._svgAxis = ctx.plotArea.svg
      .append("g")
      .attr("class", "axis") as unknown as d3.Selection<SVGGElement, unknown, SVGElement, unknown>;

    this._svgAxis.call(this._axisFn);

    this._rotateLabels();
    this._drawTitle();

    this.height = getHeight(this._svgAxis as never);
    this.width  = getWidth(this._svgAxis as never);

    this._adjustPlotArea(ctx);
  }

  /**
   * **Pass 2** — Repositions the axis group using the final plot-area dimensions,
   * then draws gridlines and (if applicable) a zero line.
   *
   * @param ctx - Axis rendering context from {@link CartesianChart}.
   */
  public draw(ctx: IAxisContext): void {
    this.scale = this._getScale(ctx);
    this._axisFn.scale(this.scale as d3.AxisScale<d3.AxisDomain>);

    this._svgAxis
      .call(this._axisFn)
      .attr("transform", `translate(${this._getX(ctx)},${this._getY(ctx)})`);

    if (this._tickStep > 1) {
      this._thinTicks(this._tickStep);
    }

    if (this._effectiveRotation % 360 !== 0) {
      this._svgAxis.selectAll(".tick text")
        .style("alignment-baseline", "middle")
        .style("text-anchor", "end")
        .attr("y", "0").attr("dy", "0");
    }

    this._alignTitle(ctx);
    this._drawGridlines(ctx);
    this._drawZeroLine(ctx);
  }

  /**
   * Sets the stroke colour of the axis domain line.
   * Used by {@link CartesianChart} to colour multi-axis charts.
   *
   * @param color - CSS colour string.
   */
  public setColor(color: string): void {
    const path = this._svgAxis.select("path");
    if (!path.empty()) {path.style("stroke", color);}
  }

  // ─── abstract-like helpers overridden by XAxis / YAxis ───────────────────

  /** Returns the appropriate scale from `ctx` for this axis type. Overridden by subclasses. */
  protected _getScale(ctx: IAxisContext): ChartScale {
    return ctx.getXScale(this); // overridden
  }

  /** Shrinks the plot area to make room for this axis. Overridden by subclasses. */
  protected _adjustPlotArea(_ctx: IAxisContext): void { /* overridden */ }

  /** Returns the X translation for this axis group. Overridden by subclasses. */
  protected _getX(_ctx: IAxisContext): number { return 0; }

  /** Returns the Y translation for this axis group. Overridden by subclasses. */
  protected _getY(_ctx: IAxisContext): number { return 0; }

  /** Draws a line at y=0 (or x=0) when the series has negative values. Overridden by subclasses. */
  protected _drawZeroLine(_ctx: IAxisContext): void { /* overridden */ }

  /** Positions the axis title text. Overridden by subclasses. */
  protected _alignTitle(_ctx: IAxisContext): void { /* overridden */ }

  // ─── shared helpers ───────────────────────────────────────────────────────

  /** Builds the appropriate d3 axis function for `_orient`. */
  protected _buildAxisFn(): AxisFn {
    const scale = this.scale as d3.AxisScale<d3.AxisDomain>;
    switch (this._orient) {
      case "bottom": return d3.axisBottom(scale);
      case "top":    return d3.axisTop(scale);
      case "right":  return d3.axisRight(scale);
      default:       return d3.axisLeft(scale);
    }
  }

  /** Appends a `<text class="axis-title">` placeholder to the axis group. */
  protected _drawTitle(): void {
    this._svgAxis.append("text")
      .text(this.title.text)
      .attr("class", "axis-title");
  }

  /**
   * Appends a `<g class="grid">` with full-length tick lines spanning the plot area.
   * Does nothing when `_gridlineType` is `None`.
   */
  protected _drawGridlines(ctx: IAxisContext): void {
    if (this._gridlineType === GridLineType.None) {return;}

    const gridAxisFn = this._buildAxisFn()
      .tickSize(this._getInnerTickSize(ctx))
      .tickFormat(() => "");

    this._svgAxis.append("g")
      .attr("class", "grid")
      .call(gridAxisFn);
  }

  /**
   * Returns the negative tick length used for full-plot-area gridlines.
   * Overridden by subclasses to return the appropriate dimension (width or height).
   */
  protected _getInnerTickSize(_ctx: IAxisContext): number { return 0; }

  /** Applies label rotation to tick text elements. Overridden by {@link XAxis}. */
  protected _rotateLabels(): void { /* overridden by XAxis */ }

  /**
   * Hides tick labels that are not at a multiple of `step`.
   * Used to prevent overlap when there are too many ticks to display at once.
   */
  protected _thinTicks(step: number): void {
    let i = 0;
    this._svgAxis.selectAll<SVGGElement, unknown>(".tick").each(function () {
      const text = d3.select(this).select("text");
      if (i++ % step === 0) {text.style("display", null);}
      else                   {text.style("display", "none");}
    });
  }

  /** Returns the default orientation for a new axis based on its type. */
  private _defaultOrient(type: AxisType, orient: OrientationType): OrientationType {
    if (orient) {return orient;}
    return type === AxisType.X ? "bottom" : "left";
  }
}

// ─── XAxis ────────────────────────────────────────────────────────────────────

/**
 * Horizontal (X) axis implementation.
 *
 * - Uses the X scale provided by `ctx.getXScale()`.
 * - Adjusts the plot area's top or bottom `axisSize` entry.
 * - Supports optional tick-label rotation.
 * - Draws a vertical zero line when the data axis has negative values.
 */
export class XAxis extends Axis {
  /** @param options - Resolved axis options. */
  public constructor(options: ResolvedAxisOptions) {
    super(AxisType.X, options);
  }

  protected override _getScale(ctx: IAxisContext): ChartScale {
    return ctx.getXScale(this);
  }

  /** Reduces `plotArea.height` and increments the appropriate `axisSize` offset. */
  protected override _adjustPlotArea(ctx: IAxisContext): void {
    if (this._orient === "bottom") {
      ctx.plotArea.axisSize.bottom += this.height;
    } else {
      ctx.plotArea.axisSize.top += this.height;
    }
    ctx.plotArea.height -= this.height;
  }

  protected override _getX(_ctx: IAxisContext): number { return 0; }

  /** Positions the axis at the bottom or top of the plot area. */
  protected override _getY(ctx: IAxisContext): number {
    return this._orient === "bottom"
      ? ctx.plotArea.axisSize.top + ctx.plotArea.height
      : ctx.plotArea.axisSize.top;
  }

  /** Returns negative plot height so gridlines span the full height. */
  protected override _getInnerTickSize(ctx: IAxisContext): number {
    return -ctx.plotArea.height;
  }

  /** Horizontally aligns the axis title based on `title.align`. */
  protected override _alignTitle(ctx: IAxisContext): void {
    const titleEl = this._svgAxis.select(".axis-title");
    if (titleEl.empty()) {return;}
    const x = align(titleEl as never, getWidth(this._svgAxis as never), this.title.align, 0);
    const h = getHeight(this._svgAxis as never);
    const y = h + 12;
    titleEl.attr("text-anchor", "start")
      .attr("transform", `translate(${x},${this._orient === "top" ? -y : y})`);
    // suppress unused variable warning
    void ctx;
  }

  /**
   * Appends a vertical `<line class="zero-line">` at x=0 when the data
   * axis contains negative values.
   */
  protected override _drawZeroLine(ctx: IAxisContext): void {
    if (!this.isDataAxis || ctx.seriesMin() >= 0) {return;}
    this._svgAxis.select(".grid")
      .append("g").attr("class", "zero-line")
      .append("line")
      .attr("x1", (this.scale as d3.ScaleLinear<number, number>)(0))
      .attr("x2", (this.scale as d3.ScaleLinear<number, number>)(0))
      .attr("y1", 0)
      .attr("y2", this._orient === "bottom" ? -ctx.plotArea.height : ctx.plotArea.height);
  }

  /**
   * Handles tick-label overlap for the X axis.
   *
   * Strategy (auto, when `labels.rotate` is 0):
   * 1. No overlap → show all labels as-is.
   * 2. Overlap → rotate labels −45° to maximise the number that fit.
   * 3. Still overlapping after rotation → also thin out (every Nth label)
   *    until overlap is resolved.
   *
   * When `labels.rotate` is set explicitly, that angle is applied directly
   * without any thinning.
   *
   * `_effectiveRotation` and `_tickStep` are stored so `draw()` can
   * re-apply both after d3 re-renders the axis in pass 2.
   */
  protected override _rotateLabels(): void {
    if (this.labels.rotate !== 0) {
      const angle = this._orient === "bottom"
        ? -Math.abs(this.labels.rotate)
        :  Math.abs(this.labels.rotate);
      this._effectiveRotation = angle;
      this._applyRotation(angle);
      return;
    }

    // 1. No overlap at all — nothing to do.
    if (!this._overlapsAtStep(1)) {
      this._effectiveRotation = 0;
      this._tickStep = 1;
      return;
    }

    // 2. Rotate −45° and see if that resolves the overlap.
    const angle = this._orient === "bottom" ? -45 : 45;
    this._effectiveRotation = angle;
    this._applyRotation(angle);

    // 3. If rotation alone is not enough, thin out as well.
    this._tickStep = this._calcTickStepRotated(angle);
    if (this._tickStep > 1) {
      this._thinTicks(this._tickStep);
    }
  }

  /** Applies a rotation transform to all tick text elements. */
  private _applyRotation(angle: number): void {
    this._svgAxis.selectAll<SVGTextElement, unknown>("text").each(function () {
      const text = d3.select(this);
      const y    = Number(text.attr("y"));
      text
        .style("alignment-baseline", "middle")
        .style("text-anchor", "end")
        .attr("y", "0").attr("dy", "0")
        .attr("transform", `translate(0,${y}) rotate(${angle})`);
    });
  }

  /**
   * Returns the smallest step N ≥ 1 such that showing every Nth label
   * (with labels rotated by `angle` degrees) produces no horizontal overlap.
   */
  private _calcTickStepRotated(angle: number): number {
    for (let step = 1; step <= 20; step++) {
      if (!this._overlapsAtStepRotated(step, angle)) {return step;}
    }
    return 20;
  }

  /**
   * Returns `true` when any two adjacent visible tick labels overlap
   * horizontally, using unrotated bounding boxes.
   * A 4 px gap is required between labels.
   */
  private _overlapsAtStep(step: number): boolean {
    const boxes: { x: number; right: number }[] = [];
    let i = 0;

    this._svgAxis.selectAll<SVGGElement, unknown>(".tick").each(function () {
      if (i++ % step === 0) {
        const tick   = d3.select(this);
        const textEl = tick.select<SVGTextElement>("text").node();
        if (!textEl) {return;}
        const bbox = textEl.getBBox();
        const m    = tick.attr("transform")?.match(/translate\(([^,)]+)/);
        const tx   = m ? parseFloat(m[1]) : 0;
        boxes.push({ x: tx + bbox.x, right: tx + bbox.x + bbox.width });
      }
    });

    boxes.sort((a, b) => a.x - b.x);
    return boxes.some((b, j) => j > 0 && b.x < boxes[j - 1].right + 4);
  }

  /**
   * Returns `true` when any two adjacent visible tick labels overlap after
   * accounting for the given rotation angle.
   *
   * With `text-anchor: end` and the label rotated by `angle`, the right edge
   * of each label sits at the tick position and the label extends to the left.
   * The projected horizontal span is `width·cos|angle| + height·sin|angle|`.
   */
  private _overlapsAtStepRotated(step: number, angle: number): boolean {
    const rad  = Math.abs(angle) * (Math.PI / 180);
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const items: { tx: number; hspan: number }[] = [];
    let i = 0;

    this._svgAxis.selectAll<SVGGElement, unknown>(".tick").each(function () {
      if (i++ % step === 0) {
        const tick   = d3.select(this);
        const textEl = tick.select<SVGTextElement>("text").node();
        if (!textEl) {return;}
        const bbox  = textEl.getBBox();
        const m     = tick.attr("transform")?.match(/translate\(([^,)]+)/);
        const tx    = m ? parseFloat(m[1]) : 0;
        const hspan = bbox.width * cosA + bbox.height * sinA;
        items.push({ tx, hspan });
      }
    });

    items.sort((a, b) => a.tx - b.tx);
    // Right edge of item[j-1] is at tx[j-1]; left edge of item[j] is at tx[j] − hspan[j].
    return items.some((item, j) => j > 0 && item.tx - item.hspan < items[j - 1].tx + 4);
  }
}

// ─── YAxis ────────────────────────────────────────────────────────────────────

/**
 * Vertical (Y) axis implementation.
 *
 * - Uses the Y scale provided by `ctx.getYScale()`.
 * - Adjusts the plot area's left or right `axisSize` entry.
 * - Draws a horizontal zero line when the data axis has negative values.
 * - Titles are rotated ±90° and aligned via `title.valign`.
 */
export class YAxis extends Axis {
  /** @param options - Resolved axis options. */
  public constructor(options: ResolvedAxisOptions) {
    super(AxisType.Y, options);
  }

  protected override _getScale(ctx: IAxisContext): ChartScale {
    return ctx.getYScale(this);
  }

  /** Reduces `plotArea.width` and increments the appropriate `axisSize` offset. */
  protected override _adjustPlotArea(ctx: IAxisContext): void {
    if (this._orient === "left") {
      ctx.plotArea.axisSize.left += this.width;
    } else {
      ctx.plotArea.axisSize.right += this.width;
    }
    ctx.plotArea.width -= this.width;
  }

  /** Positions the axis at the left or right edge of the plot area. */
  protected override _getX(ctx: IAxisContext): number {
    return this._orient === "left"
      ? ctx.plotArea.axisSize.left
      : ctx.plotArea.axisSize.left + ctx.plotArea.width;
  }

  protected override _getY(_ctx: IAxisContext): number { return 0; }

  /** Returns negative plot width so gridlines span the full width. */
  protected override _getInnerTickSize(ctx: IAxisContext): number {
    return -ctx.plotArea.width;
  }

  /** Vertically aligns the axis title and rotates it ±90°. */
  protected override _alignTitle(ctx: IAxisContext): void {
    const titleEl = this._svgAxis.select(".axis-title");
    if (titleEl.empty()) {return;}
    const rotation = this._orient === "left" ? -90 : 90;
    const x = (getWidth(this._svgAxis as never) + 4) * (this._orient === "left" ? -1 : 1);
    // Use the actual plot height so centering is exact regardless of the axis group's
    // bounding box. text-anchor:middle means the transform origin is the text's midpoint.
    const h = ctx.plotArea.height;
    const y = this.title.valign === "bottom" ? h
            : this.title.valign === "top"    ? 0
            : h / 2;
    titleEl
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${x},${y}) rotate(${rotation})`);
  }

  /**
   * Appends a horizontal `<line class="zero-line">` at y=0 when the data
   * axis contains negative values.
   */
  protected override _drawZeroLine(ctx: IAxisContext): void {
    if (!this.isDataAxis || ctx.seriesMin() >= 0) {return;}
    const y0 = (this.scale as d3.ScaleLinear<number, number>)(0);
    this._svgAxis.select(".grid")
      .append("g").attr("class", "zero-line")
      .append("line")
      .attr("x1", 0)
      .attr("x2", this._orient === "left" ? ctx.plotArea.width : -ctx.plotArea.width)
      .attr("y1", y0).attr("y2", y0);
  }
}
