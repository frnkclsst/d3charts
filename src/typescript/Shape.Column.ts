/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGColumn extends SVGShape {
        protected chart: ColumnChart;

        constructor(svg: D3.Selection, chart: ColumnChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
        }

        public draw(): void {
            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie)
                .selectAll("rect")
                .data(this.chart.series.getMatrixItem(this.serie))
                .enter();

            // draw column
            var svgColumn = svgSerie.append("rect")
                .attr({
                    "class": "column",
                    "fill": ColorPalette.color(this.serie),
                    "height": 0,
                    "stroke": ColorPalette.color(this.serie),
                    "stroke-width": "1px",
                    "width": (d: any, i: number): void => {
                        return this.chart.getWidth(d, i, this.serie);
                    },
                    "x": (d: any, i: number): void => {
                        return this.chart.getXCoordinate(d, i, this.serie);
                    },
                    "y": (d: any, i: number): void => {
                        if (d.y < 0) {
                            return this.chart.yAxes[0].scale(0); // TODO - take the right axis in case there are multiple
                        }
                        else {
                            return (this.chart.getHeight(d, i, this.serie) + this.chart.getYCoordinate(d, i, this.serie));
                        }
                    }
                });

            // add animation
            var duration = this.chart.settings.series.animate === true ? 600 : 0;
            var count = 0;
            svgColumn
                .each((): void => {
                    count++; // count number of bars
                })
                .transition()
                .duration(duration)
                .attr({
                    "height": (d: any, i: number): void => { return this.chart.getHeight(d, i, this.serie); },
                    "y": (d: any, i: number): void => { return this.chart.getYCoordinate(d, i, this.serie); }
                })
                .each("end", (): void => {
                    count--;
                    if (this.chart.settings.series.labels.enabled === true && !count) { // only draw labels after all transitions ended
                        this.drawLabels();
                    }
                });

            // draw tooltip
            this.chart.tooltip.draw(svgColumn, this.serie);
        }

        public drawLabels(): void {
            super.drawLabels();
            d3.selectAll("g#serie-" + this.serie).selectAll("rect")
                .each((d: any, i: number): void  => {
                    var rotation = 0;
                    var x = this.chart.getXCoordinate(d, i, this.serie);
                    var y = this.chart.getYCoordinate(d, i, this.serie);
                    var dx = 0;
                    var dy = 0;

                    if (this.chart.settings.series.labels.rotate === true) {
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