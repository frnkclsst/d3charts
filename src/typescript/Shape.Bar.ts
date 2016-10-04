/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGBar {
        public svg: D3.Selection;

        private serie: number;
        private chart: ColumnChart;

        constructor(svg: D3.Selection, chart: BarChart, serie: number) {
            this.chart = chart;
            this.serie = serie;
            this.svg = svg;
        }

        public draw(): void {
            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie)
                .selectAll("rect")
                .data(this.chart.series.getMatrixItem(this.serie))
                .enter();

            // draw single bar
            var svgBar = svgSerie.append("rect")
                .attr({
                    "class": "bar",
                    "fill": ColorPalette.color(this.serie),
                    "height": (d: any, i: number): number => {
                        return this.chart.getHeight(d, i, this.serie);
                    },
                    "width": 0,
                    "x": (d: any, i: number): number => {
                        if (d.y < 0) {
                            return this.chart.xAxes[0].scale(0); // TODO - take the right axis in case there are multiple
                        }
                        else {
                            return this.chart.getXCoordinate(d, i, this.serie);
                        }
                    },
                    "y": (d: any, i: number): void => { return this.chart.getYCoordinate(d, i, this.serie); }
                });

            // add animation
            var duration = this.chart.settings.series.animate === true ? 600 : 0;
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
                    count--;
                    if (this.chart.settings.series.labels.enabled === true && !count) { // only draw labels after all transitions ended
                        this.chart.drawLabels(this.svg);
                    }
                });

            // draw tooltip
            this.chart.tooltip.draw(svgBar, this.serie);
        }
    }
}