import type * as d3 from "d3";
import { ChartArea } from "./ChartArea";
import { align, getHeight } from "../utils/dom";
import type { ResolvedTitleOptions } from "./Options";

/**
 * Renders the chart title and optional subtitle inside a `<g class="titlearea">` group.
 *
 * The title area is skipped entirely when `height === 0`.
 * Text positions are computed from `textAlign` and `margin` using the DOM measurement
 * helpers in `utils/dom`.
 */
export class TitleArea extends ChartArea {
  /** Horizontal alignment: `"left"` | `"center"` | `"right"`. */
  public readonly textAlign: string;
  /** Left/right margin applied before alignment is calculated (px). */
  public readonly margin: number;
  /** Whether the title area sits at the `"top"` or `"bottom"` of the canvas. */
  public readonly position: string;
  /** Optional subtitle text rendered below the main title. */
  public readonly subTitle: string;
  /** Main title text. */
  public readonly text: string;

  /**
   * @param options - Resolved title options produced by {@link resolveOptions}.
   */
  public constructor(options: ResolvedTitleOptions) {
    super();
    this.textAlign = options.align;
    this.border    = { ...options.border };
    this.height    = options.height;
    this.margin    = options.margin;
    this.position  = options.position;
    this.subTitle  = options.subtitle;
    this.text      = options.text;
  }

  /**
   * Appends the title area group to the canvas SVG and renders the title / subtitle text.
   * Does nothing when `this.height === 0`.
   *
   * @param canvasSvg - The root SVG element produced by {@link Canvas.draw}.
   */
  public draw(canvasSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>): void {
    if (this.height === 0) {return;}

    this.svg = canvasSvg
      .append("g")
      .attr("class", "titlearea")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("transform", `translate(${this.x},${this.y})`);

    const titleGroup = this.svg.append("g").attr("class", "title");

    const titleText = titleGroup.append("text")
      .attr("class", "title")
      .text(this.text);

    const subTitleText = titleGroup.append("text")
      .attr("class", "subtitle")
      .text(this.subTitle);

    const x         = align(titleGroup as never, this.width, this.textAlign, this.margin);
    const xSub      = align(subTitleText as never, this.width, this.textAlign, this.margin);
    const titleH    = getHeight(titleText as never);
    const subH      = getHeight(subTitleText as never);
    const y         = (this.height + titleH - subH) / 2;

    titleText.attr("transform", `translate(${x},${y})`);
    subTitleText.attr("transform", `translate(${xSub},${y + subH})`);

    this.drawBorders();
  }
}
