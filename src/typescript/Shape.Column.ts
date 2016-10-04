/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGColumn {
        public svg: D3.Selection;

        private serie: number;
        private chart: ColumnChart;

        constructor(svg: D3.Selection, chart: ColumnChart, serie: number) {
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

            // draw column
            var svgColumn = svgSerie.append("rect")
                .attr({
                    "class": "bar",
                    "fill": ColorPalette.color(this.serie),
                    "height": 0,
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
                .each((): void => { count++; })
                .transition()
                .duration(duration)
                .attr({
                    "height": (d: any, i: number): void => { return this.chart.getHeight(d, i, this.serie); },
                    "y": (d: any, i: number): void => { return this.chart.getYCoordinate(d, i, this.serie); }
                })
                .each("end", (): void => {
                    count--;
                    if (this.chart.settings.series.labels.enabled === true && !count) { // only draw labels after all transitions ended
                        this.chart.drawLabels(this.svg);
                    }
                });

            // draw tooltip
            this.chart.tooltip.draw(svgColumn, this.serie);
        }
    }
}