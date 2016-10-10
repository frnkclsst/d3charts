/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGBar extends SVGShape {
        protected chart: BarChart;

        constructor(svg: D3.Selection, chart: BarChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
        }

        public draw(): void {
            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie)
                .selectAll("rect")
                .data(this.chart.series.getMatrixItem(this.serie))
                .enter();

            // draw bar
            var svgBar = svgSerie.append("rect")
                .attr({
                    "class": "bar",
                    "fill": ColorPalette.color(this.serie),
                    "height": (d: any, i: number): number => {
                        return this.chart.getHeight(d, i, this.serie);
                    },
                    "stroke": ColorPalette.color(this.serie),
                    "stroke-width": "1px",
                    "width": 0,
                    "x": (d: any, i: number): number => {
                        if (d.y < 0) {
                            // TODO - take the right axis in case there are multiple
                            return this.chart.xAxes[0].scale(0);
                        }
                        else {
                            return this.chart.getXCoordinate(d, i, this.serie);
                        }
                    },
                    "y": (d: any, i: number): void => { return this.chart.getYCoordinate(d, i, this.serie); }
                });

            // add animation
            var duration = this.chart.options.series.animate === true ? 600 : 0;
            var count = 0;
            svgBar
                .each((): void => {
                    count++; // count number of bars
                })
                .transition()
                .duration(duration)
                .attr("width", (d: any, i: number): number => {
                    return this.chart.getWidth(d, i, this.serie);
                })
                .attr("x", (d: any, i: number): number => {
                    return this.chart.getXCoordinate(d, i, this.serie);
                })
                .each("end", (): void => {
                    console.log(count);
                    count--;
                    if (this.chart.options.series.labels.visible === true && !count) { // only draw labels after all transitions ended
                        this.drawLabels();
                    }
                });

            // draw tooltip
            this.chart.tooltip.draw(svgBar, this.serie);
        }

        /* Make this shape independent by using a callback
        public testDraw(x: (d: any, i: number, serie: number) => void, d: any, i: number): void {
            x(d, i, this.serie);
        }
        */

        public drawLabels(): void {
            super.drawLabels();
            d3.selectAll("g#serie-" + this.serie).selectAll("rect")
                .each((d: any, i: number): void => {
                    var rotation = 0;
                    var x = this.chart.getXCoordinate(d, i, this.serie);
                    var y = this.chart.getYCoordinate(d, i, this.serie);
                    var dx = 0;
                    var dy = 0;

                    if (this.chart.options.series.labels.rotate === true) {
                        rotation = -90;
                    }

                    if (rotation != 0) {
                        dx = -this.chart.getHeight(d, i, this.serie) / 2;
                        dy = this.chart.getWidth(d, i, this.serie) / 2;
                    }
                    else {
                        dx = this.chart.getWidth(d, i, this.serie) / 2;
                        dy = this.chart.getHeight(d, i, this.serie) / 2;
                    }

                    this.svgLabels.append("text")
                        .text(d3.format(this.chart.series.items[this.serie].format)(d.y))
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
}