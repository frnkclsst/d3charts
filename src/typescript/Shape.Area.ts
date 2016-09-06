/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGArea {

        private chart: XYChart;
        private color: string;
        private interpolation: string;
        private data: any;
        private serie: number;
        private showMarkers: boolean;
        private svg: D3.Selection;
        private x: number;
        private y: number;
        private y0: number;

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            this.chart = chart;
            this.color = ColorPalette.getColor(serie);
            this.data = chart.series.getMatrixItem(serie);
            this.interpolation = chart.interpolation;
            this.serie = serie;
            this.showMarkers = chart.showMarkers;
            this.svg = svg;
            this.x = chart.getXCoordinate(serie);
            this.y = chart.getYCoordinate(serie);
            this.y0 = chart.getY0Coordinate(serie);
        }

        public draw(): void {
            var svgArea = this.svg.append("g")
                .attr("id", "area-" + this.serie);

            var d3Area = d3.svg.area()
                .interpolate(this.interpolation)
                .x(this.x)
                .y0(this.y0)
                .y1(this.y);

            svgArea.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.data))
                .style("fill", this.color)
                .style("opacity", "0.2");
        }
    }
}