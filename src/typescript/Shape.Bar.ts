"use strict";

import * as d3 from "d3";
import { IDatum } from "./IInterfaces";
import { AxisType } from "./Enums";
import { SVGShape } from "./Shape";
import { XYChart } from "./XYChart";

export class SVGBar extends SVGShape {
    protected chart: XYChart;

    public height: (d: IDatum, i: number, serie: number) => number;
    public width: (d: IDatum, i: number, serie: number) => number;

    constructor(svg: d3.Selection<SVGElement>, chart: XYChart, serie: number) {
        super(svg, chart, serie);
        this.chart = chart;

        this.height = null;
        this.width = null;
    }

    public draw(data: IDatum[]): void {
        var svgSerie = this.svg.append("g")
            .attr("id", "serie-" + this.serie)
            .selectAll("rect")
            .data(data)
            .enter();

        // draw bar
        var svgBar: d3.Selection<{}> = svgSerie.append("rect")
            .attr({
                "class": "bar",
                "fill": this.color,
                "height": (d: IDatum, i: number): number => {
                    return this.height(d, i, this.serie);
                },
                "stroke": this.color,
                "stroke-width": "1px",
                "width": 0,
                "x": (d: IDatum, i: number): number => {
                    if (d.y < 0) {
                        var index = this.chart.getAxisByName(AxisType.X, this.chart.series.items[this.serie].axis);
                        return this.chart.axes[index].scale(0);
                    }
                    else {
                        return this.x(d, i, this.serie);
                    }
                },
                "y": (d: IDatum, i: number): number => { return this.y(d, i, this.serie); }
            });

        // add animation
        var count = 0;
        svgBar
            .each((): void => {
                count++; // count number of bars
            })
            .transition()
            .duration(this.animation.duration)
            .ease(this.animation.ease)
            .attr("width", (d: IDatum, i: number): number => {
                return this.width(d, i, this.serie);
            })
            .attr("x", (d: IDatum, i: number): number => {
                return this.x(d, i, this.serie);
            })
            .each("end", (): void => {
                count--;
                if (this.labels.visible === true && !count) { // only draw labels after all transitions ended
                    this.drawLabels();
                }
            });

        // draw tooltip
        this.chart.tooltip.draw(svgBar, this.serie);
    }

    public drawLabels(): void {
        super.drawLabels();
        this.svg.selectAll("g#serie-" + this.serie).selectAll("rect")
            .each((d: IDatum, i: number): void => {
                var rotation = 0;
                var x = this.x(d, i, this.serie);
                var y = this.y(d, i, this.serie);
                var dx = 0;
                var dy = 0;

                if (this.labels.rotate === true) {
                    rotation = -90;
                }

                if (rotation != 0) {
                    dx = -this.height(d, i, this.serie) / 2;
                    dy = this.width(d, i, this.serie) / 2;
                }
                else {
                    dx = this.width(d, i, this.serie) / 2;
                    dy = this.height(d, i, this.serie) / 2;
                }

                this.svgLabels.append("text")
                    .text(d3.format(this.labels.format)(d.y))
                    .style("text-anchor", "middle")
                    .attr({
                        "alignment-baseline": "central",
                        "class": "label",
                        "fill": "#fff",
                        "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")",
                        "dx": dx,
                        "dy": dy
                    });
            });
    }
}
