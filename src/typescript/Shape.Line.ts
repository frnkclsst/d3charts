/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGLine {

        public svg: D3.Selection;

        private chart: XYChart;
        private color: string;
        private interpolation: string;
        private data: any;
        private serie: number;
        private showMarkers: boolean;

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            this.chart = chart;
            this.color = ColorPalette.getColor(serie);
            this.data = chart.series.getMatrixItem(serie);
            this.interpolation = chart.interpolation;
            this.serie = serie;
            this.showMarkers = chart.showMarkers;
            this.svg = svg;
        }

        public draw(): void {
            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie);

            var d3Line = d3.svg.line()
                .interpolate(this.interpolation)
                .x((d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); })
                .y((d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); });

            var svgLine = svgSerie.append("path")
                .attr("class", "line")
                .attr("d", d3Line(this.data))
                .attr("stroke", this.color)
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add animation
            var duration = this.chart.settings.series.animate == true ? 1000 : 0;
            var length = svgLine[0][0].getTotalLength();

            svgLine
                .attr("stroke-dasharray", length + " " + length)
                .attr("stroke-dashoffset", length)
                .transition()
                .duration(duration)
                .attr("stroke-dashoffset", 0);

            // draw markers
            if (this.showMarkers) {
                var svgMarkers =  this.drawMarkers(svgSerie, this.serie);

                // draw tooltip
                this.chart.tooltip.draw(svgMarkers, this.serie);
            }
        }

        private drawMarkers(svg: D3.Selection, serie: number): D3.Selection {
            var svgMarkers = svg.selectAll(".marker")
                .data(this.data)
                .enter().append("circle")
                .attr("class", "marker")
                .attr("stroke", ColorPalette.getColor(serie))
                .attr("stroke-width", "0")
                .attr("fill", ColorPalette.getColor(serie))
                .attr("cx", (d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); })
                .attr("cy", (d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); })
                .attr("r", 4);

            return svgMarkers;
        }

    }
}