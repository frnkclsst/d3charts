import * as d3 from "d3";
import { Chart } from "./Chart";
import type { IChartData, IOptions } from "../types/interfaces";
import { easeFromString } from "../utils/ease";

/** Internal shape of a datum after d3.pie() processing. */
interface IArcDatum {
  startAngle: number;
  endAngle: number;
  padAngle: number;
  value: number;
  data: number;
}

/**
 * Pie chart — each series produces one ring of arc slices centred in the plot area.
 *
 * When multiple series are provided each series occupies a concentric ring, with the
 * first series in the innermost ring and subsequent series in outer rings.
 *
 * The legend shows **category** labels (one per slice) rather than series labels.
 * Clicking a legend item calls the overridden {@link toggleSerie} which shows/hides
 * the corresponding slice across all rings.
 *
 * Slices animate from their start angle (zero-width) to their final end angle.
 * Value labels (if enabled) are appended inside each slice centroid after animation.
 *
 * @example
 * ```ts
 * const chart = new PieChart("#chart", data, {
 *   plotOptions: { pie: { innerRadius: 0 } },
 *   series: { labels: { visible: true, format: ".0%" } },
 * });
 * chart.draw();
 * ```
 */
export class PieChart extends Chart {
  /** d3 arc generators, one per series ring. Stored for centroid calculations during label drawing. */
  private readonly _arcs: d3.Arc<unknown, IArcDatum>[] = [];

  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data. Each series provides slice values for one ring.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Legend labels = category names (one per slice)
    this.canvas.legendArea.items = this.categories.labels;

    // Legend swatches inherit fill-opacity/stroke from the .slice CSS class
    this.canvas.legendArea.swatchCssClass = "slice";
  }

  /** Renders the canvas layout and all pie/donut rings. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const pa    = this.canvas.plotArea;
    const inner = this.options.plotOptions.pie.innerRadius;
    const { duration, ease } = this.options.plotOptions.animation;

    const radius      = Math.min(pa.width / 2, pa.height / 2);
    const innerRadius = radius * inner;
    // Each series ring receives an equal share of the available radial space
    const serieWidth  = this.series.length > 0
      ? (radius - innerRadius) / this.series.length
      : radius;

    const svgSeries = pa.svg
      .append("g")
      .attr("class", "series")
      .attr("transform", `translate(${pa.width / 2},${pa.height / 2})`);

    for (let s = 0; s < this.series.length; s++) {
      const arc = d3.arc<IArcDatum>()
        .innerRadius(innerRadius + serieWidth * s)
        .outerRadius(innerRadius + serieWidth * (s + 1));

      this._arcs.push(arc as d3.Arc<unknown, IArcDatum>);

      const pie = d3.pie<number>().sort(null);
      const pieData = pie(this.series.items[s].data);

      const serieGroup = svgSeries
        .append("g")
        .attr("id", `serie-${s}`);

      const slices = serieGroup
        .selectAll<SVGGElement, d3.PieArcDatum<number>>("g.slice")
        .data(pieData)
        .enter()
        .append("g")
        .attr("id", (_d, i) => `slice-${i}`)
        .attr("class", "slice");

      const paths = slices
        .append("path")
        .attr("fill", (_d, i) => this.colorPalette.color(i))
        .attr("data-serie", s)
        .attr("d", (d) => arc(d as unknown as IArcDatum) ?? "");

      const _pieData = pieData; // capture for extractor closure
      this.tooltip.attach(paths as never, s, (datum, _i, allData) => {
        const d     = datum as d3.PieArcDatum<number>;
        const total = (allData as typeof _pieData).reduce((sum, x) => sum + x.value, 0);
        const fmt    = this.options.tooltip.valuePointFormat || this.series.items[s]?.format || "";
        const suffix = this.options.tooltip.valueSuffix      || this.series.items[s]?.suffix || "";
        const f      = fmt ? d3.format(fmt) : String;
        return {
          value:      `${f(d.value)}${suffix}`,
          percent:    total > 0 ? `${Math.round((d.value / total) * 100)}%` : "",
          colorIndex: _i
        };
      });

      let pending = pieData.length;

      // Animate each arc from startAngle to endAngle using interpolation
      paths
        .transition()
        .duration(duration)
        .ease(easeFromString(ease))
        .attrTween("d", (d) => {
          const start = { ...d, endAngle: d.startAngle };
          const interp = d3.interpolate(start, d);
          return (t: number): string => arc(interp(t) as unknown as IArcDatum) ?? "";
        })
        .on("end", () => {
          pending--;
          if (pending === 0 && this.options.series.labels.visible) {
            this._drawLabels(svgSeries);
          }
        });
    }
  }

  /**
   * Overrides {@link Chart.toggleSerie} to toggle individual **slices** (by category index)
   * rather than entire series groups, since the pie legend represents categories.
   *
   * @param index - Zero-based category / slice index.
   */
  public override toggleSerie(index: number): void {
    const opacity = d3.select(`${this.selector} #slice-${index}`).style("opacity") === "1" ? 0 : 1;
    d3.selectAll(`${this.selector} #slice-${index}`).transition().duration(200).style("opacity", opacity);
    d3.selectAll(`${this.selector} #labels-${index}`).transition().duration(200).style("opacity", opacity);
  }

  /**
   * Appends value labels inside each slice at the arc's centroid.
   * Called once per series ring after all slices in that ring have finished animating.
   */
  private _drawLabels(
    svgSeries: d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>
  ): void {
    const fmt = (format: string): ((v: number) => string) =>
      format ? d3.format(format) : (v: number): string => String(v);

    for (let s = 0; s < this.series.length; s++) {
      const labelsGroup = svgSeries
        .append("g")
        .attr("id", `labels-${s}`);

      const arc = this._arcs[s];

      d3.select(`${this.selector} #serie-${s}`)
        .selectAll<SVGGElement, d3.PieArcDatum<number>>(".slice")
        .each((d) => {
          const centroid = arc.centroid(d as unknown as IArcDatum);
          labelsGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("class", "label")
            .attr("fill", "#fff")
            .attr("transform", `translate(${centroid})`)
            .text(fmt(this.series.items[s].format)(d.data));
        });
    }
  }
}

/**
 * Donut chart — a {@link PieChart} with `plotOptions.pie.innerRadius` defaulting to `0.6`.
 *
 * The inner radius can be further customised by passing `plotOptions.pie.innerRadius`
 * in the options (0 = full pie, approaching 1 = very thin ring).
 *
 * @example
 * ```ts
 * const chart = new DonutChart("#chart", data);
 * chart.draw();
 * ```
 */
export class DonutChart extends PieChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, {
      ...options,
      plotOptions: {
        ...options?.plotOptions,
        pie: { innerRadius: options?.plotOptions?.pie?.innerRadius ?? 0.6 }
      }
    });
  }
}
