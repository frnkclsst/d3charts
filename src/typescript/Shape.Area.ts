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

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            this.chart = chart;
            this.color = ColorPalette.color(serie);
            this.data = chart.series.getMatrixItem(serie);
            this.interpolation = chart.interpolation;
            this.serie = serie;
            this.showMarkers = chart.showMarkers;
            this.svg = svg;
        }

        public draw(): void {
            var d3Area = d3.svg.area()
                .interpolate(this.interpolation)
                .x((d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); } )
                .y0((d: any, i: number): number => { return this.chart.getY0Coordinate(d, i, this.serie); })
                .y1((d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); });

            var svgArea = this.svg.append("g")
                .attr("id", "area-" + this.serie);

            var svgPath = svgArea.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.data))
                .style("fill", this.color)
                .style("opacity", "0");

            // add animation
            var duration = this.chart.settings.series.animate === true ? 2000 : 0;
            svgPath
                .transition()
                .duration(duration)
                .style("opacity", "0.2");
        }
    }
}