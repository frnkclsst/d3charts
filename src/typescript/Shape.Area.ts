"use strict";

import { SVGShape } from "./Shape";
import { XYChart } from "./XYChart";
import { LineChart } from "./LineChart";

export class SVGArea extends SVGShape {
    protected chart: XYChart;

    public interpolation: string;
    public y0: (d: any, i: number, serie: number) => number;
    public y1: (d: any, i: number, serie: number) => number;

    constructor(svg: D3.Selection, chart: LineChart, serie: number) {
        super(svg, chart, serie);
        this.chart = chart;

        this.interpolation = "linear";
        this.y0 = null;
        this.y1 = null;
    }

    public draw(data: any): void {
        var d3Area = d3.svg.area()
            .interpolate(this.interpolation)
            .x((d: any, i: number): number => { return this.x(d, i, this.serie); } )
            .y0((d: any, i: number): number => { return this.y0(d, i, this.serie); })
            .y1((d: any, i: number): number => { return this.y1(d, i, this.serie); });

        var svgArea = this.svg.append("g")
            .attr("id", "area-" + this.serie);

        var svgPath = svgArea.append("path")
            .attr("class", "area")
            .attr("d", d3Area(data))
            .style("fill", this.color)
            .style("opacity", 0);

        // add animation
        svgPath
            .transition()
            .duration(this.animation.duration)
            .ease(this.animation.ease)
            .style("opacity", this.opacity);
    }
}