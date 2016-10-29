/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGShape {

        protected chart: Chart;
        protected serie: number; // TODO - this should be done differently
        protected svg: D3.Selection;
        protected svgLabels: D3.Selection;

        constructor(svg: D3.Selection, chart: Chart, serie: number) {
            this.chart = chart;
            this.serie = serie;
            this.svg = svg;
        }

        public draw(data: any): void {

        }

        public drawLabels(): void {
            this.svgLabels = this.svg.append("g")
                .attr("id", "labels-" + this.serie)
                .attr("opacity", "1");
        }

        public showLabels(): void {
            d3.selectAll("#labels-" + this.serie)
                .attr("opacity", "1");
        }

        public hideLabels(): void {
            d3.selectAll("#labels-" + this.serie)
                .attr("opacity", "0");
        }
    }
}