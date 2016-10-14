/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGArea extends SVGShape {
        protected chart: XYChart;

        public x: (d: any, i: number, serie: number) => number;
        public y: (d: any, i: number, serie: number) => number;
        public y0: (d: any, i: number, serie: number) => number;

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
            this.x = null;
            this.y = null;
            this.y0 = null;
        }

        public draw(data: any): void {
            var d3Area = d3.svg.area()
                .interpolate(this.chart.options.linechart.interpolation)
                .x((d: any, i: number): number => { return this.x(d, i, this.serie); } )
                .y0((d: any, i: number): number => { return this.y0(d, i, this.serie); })
                .y1((d: any, i: number): number => { return this.y(d, i, this.serie); });

            var svgArea = this.svg.append("g")
                .attr("id", "area-" + this.serie);

            var svgPath = svgArea.append("path")
                .attr("class", "area")
                .attr("d", d3Area(data))
                .style("fill", ColorPalette.color(this.serie))
                .style("opacity", "0");

            // add animation
            var duration = this.chart.options.series.animate === true ? 2000 : 0;
            svgPath
                .transition()
                .duration(duration)
                .style("opacity", this.chart.options.linechart.area.opacity);
        }
    }
}