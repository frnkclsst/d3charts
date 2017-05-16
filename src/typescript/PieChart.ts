"use strict";

import * as d3 from "d3";
import { IArcDatum, IChartData, IOptions } from "./IInterfaces";
import { Chart } from "./Chart";

export class PieChart extends Chart {
    private _arcs: any[] = [];
    private _innerRadiusPercentage: number;
    private _innerRadius: number;
    private _radius: number;
    private _serieRadius: number;

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);
        this._innerRadiusPercentage = this.options.plotOptions.pie.innerRadius;

        // Overrides
        this.canvas.legendArea.items = this.categories.labels;
    }

    public draw(): void {
        super.draw();

        if (this.hasData()) {
            var _self = this;

            this._radius = Math.min(this.canvas.plotArea.width / 2, this.canvas.plotArea.height / 2);
            this._innerRadius = this._radius - (this._radius * this._innerRadiusPercentage);
            this._serieRadius = (this._radius - this._innerRadius) / this.series.length;

            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series")
                .attr("transform", "translate(" + (this.canvas.plotArea.width / 2) + "," + (this.canvas.plotArea.height / 2) + ")");

            for (var serie = 0; serie < this.series.length; serie++) {
                var d3Pie = d3.layout.pie()
                    .sort(null);

                var d3Arc = d3.svg.arc()
                    .innerRadius(this._innerRadius + (this._serieRadius * serie)) // inner radius = 1 => pie chart
                    .outerRadius(this._serieRadius * (serie + 1) + this._innerRadius);
                this._arcs.push(d3Arc);

                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + serie);

                var svgArcs = svgSerie.selectAll("g.slice")
                    .data(d3Pie(this.series.items[serie].data))
                    .enter()
                    .append("g")
                    .attr("id", (d: IArcDatum, i: number): string => {
                        return "slice-" + i;
                    })
                    .attr("class", "slice");

                // draw arcs
                var svgPath = svgArcs.append("path")
                    .attr("fill", (d: IArcDatum, i: number): string => {
                        return this.colorPalette.color(i);
                    })
                    .attr("data-serie", serie)
                    .attr("d", function (d: any /*d3.svg.Arc*/): string {
                        return d3Arc(d);
                    });

                // add animation
                var count = 0;
                svgPath
                    .each((): void => {
                        count++;
                    })
                    .transition()
                    .duration(this.options.plotOptions.animation.duration)
                    .ease(this.options.plotOptions.animation.ease)
                    .attrTween("d", function (d: IArcDatum, i: number): any {
                        var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                        var s = this.getAttribute("data-serie");
                        var arc = _self._arcs[s];
                        return (t: any): any => {
                            d.endAngle = interpolate(t);
                            return arc(d);
                        };
                    })
                    .each("end", (): void => {
                        count--;
                        if (this.options.series.labels.visible === true && !count) {
                            this.drawLabels(svgSeries);
                        }
                    });

                // draw tooltip
                this.tooltip.draw(svgPath, serie, true);
            }
        }
    }

    public drawLabels(svg: d3.Selection<SVGElement>): void {
        for (var serie = 0; serie < this.series.length; serie++) {
            var svgLabels = svg.append("g").attr("id", "labels-" + serie);
            this.canvas.svg.selectAll("g#serie-" + serie).selectAll(".slice")
                .each((d: IArcDatum, i: number): void  => {
                    svgLabels.append("text")
                        .style("text-anchor", "middle")
                        .attr({
                            "alignment-baseline": "central",
                            "class": "label",
                            "fill": "#fff",
                            "transform": (): string => {
                                return "translate(" + this._arcs[serie].centroid(d) + ")";
                            }
                        })
                        .text(d3.format(this.series.items[serie].format)(d.data));
                });
        }
    }

    public toggleSerie(data: string[], index: number): void {
        var slice = d3.selectAll(this.selector + " #slice-" + index);
        var opacity = slice.style("opacity") === "1" ? 0 : 1;
        d3.selectAll(this.selector + " #slice-" + index).transition().duration(200).style("opacity", opacity);
        // TODO - remove right labels in pie chart when clicking a legend item
        d3.selectAll(this.selector + " #labels-" + index).transition().duration(200).style("opacity", opacity);
    }
}
