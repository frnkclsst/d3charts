/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class ComboChart extends XYChart {
        public args: any;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.args = args;
        }

        public draw(): void {
            super.draw();

            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            for (var i = 0; i < this.series.length; i++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + i);

                var lineChart = new LineChart(this.args, this.selector);
                var line = new Line(svgSerie, lineChart, i);
                line.draw();
            }
        }
    }
}