/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGArea extends SVGShape {
        protected chart: LineChart;

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
        }

        public draw(): void {
            var d3Area = d3.svg.area()
                .interpolate(this.chart.interpolation)
                .x((d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); } )
                .y0((d: any, i: number): number => { return this.chart.getY0Coordinate(d, i, this.serie); })
                .y1((d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); });

            var svgArea = this.svg.append("g")
                .attr("id", "area-" + this.serie);

            var svgPath = svgArea.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.chart.series.getMatrixItem(this.serie)))
                .style("fill", ColorPalette.color(this.serie))
                .style("opacity", "0");

            // add animation
            var duration = this.chart.settings.series.animate === true ? 2000 : 0;
            svgPath
                .transition()
                .duration(duration)
                .style("opacity", this.chart.settings.linechart.area.opacity);
        }
    }
}