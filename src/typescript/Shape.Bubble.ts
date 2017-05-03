"use strict";

import { SVGShape } from "./Shape";
import { XYChart } from "./XYChart";

export class SVGBubble extends SVGShape {
    protected chart: XYChart;

    public marker: {
        type: string;
    };

    constructor(svg: D3.Selection, chart: XYChart, serie: number) {
        super(svg, chart, serie);
        this.chart = chart;

        this.marker = {
            type: "circle"
        };
    }

    public draw(data: any): void {
        var _self = this;

        var svgSerie = this.svg.append("g")
            .attr("id", "serie-" + (this.serie - 1))
            .selectAll("path")
            .data(data)
            .enter();

        var svgBubbles = svgSerie.append("path")
            .each(function(d: any, i: number): void {
                d3.select(this)
                    .attr({
                        "class": "bubble",
                        "d": d3.svg.symbol()
                            .size(0)
                            .type(_self.marker.type)(),
                        "fill": _self.color,
                        "stroke": _self.color,
                        "stroke-width": 0,
                        "transform": "translate(" + _self.x(d, i, 0) + ", " + _self.y(d, i, _self.serie) + ")"
                    });
            });

        // add animation
        var count = 0;
        svgBubbles
            .each((): void => {
                count++; // count number of bars
            })
            .transition()
            .duration(this.animation.duration)
            .ease(this.animation.ease)
            .attr("d", (d: any, i: number): any => {
                var size = _self.chart.series.items[this.serie].size != undefined ? _self.chart.series.items[this.serie].size[i] * 10 : 60;
                return d3.svg.symbol()
                    .size(size)
                    .type(_self.marker.type)();
            })
            .each("end", (): void => {
                count--;
                if (this.labels.visible === true && !count) { // only draw labels after all transitions ended
                    this.drawLabels();
                }
            });

        // draw tooltip
        this.chart.tooltip.draw(svgBubbles, this.serie);
    }

    public drawLabels(): void {
        this.svgLabels = this.svg.append("g")
            .attr("id", "labels-" + (this.serie - 1))
            .attr("opacity", "1");

        this.svg.selectAll("g#serie-" + (this.serie - 1)).selectAll("path.bubble")
            .each((d: any, i: number): void => {
                var rotation = 0;
                var x = this.x(d, i, this.serie);
                var y = this.y(d, i, this.serie);
                var dx = 0;
                var dy = 0;

                if (this.labels.rotate === true) {
                    rotation = -90;
                }

                var text = this.svgLabels.append("text")
                    .text(d3.format(this.labels.format)(this.chart.series.items[this.serie].data[i]))
                    .style("text-anchor", "middle")
                    .attr({
                        "alignment-baseline": "central",
                        "class": "label",
                        "fill": "#fff",
                        "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                    });

                text
                    .attr("dy", dy)
                    .attr("dx", dx);
            });
    }

}