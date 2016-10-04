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

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            this.chart = chart;
            this.color = ColorPalette.color(serie);
            this.data = chart.series.getMatrixItem(serie); // TODO - Feed it in, make it more independent
            this.interpolation = chart.interpolation;
            this.serie = serie;
            this.svg = svg;
        }

        public draw(): void {
            var d3Line = d3.svg.line()
                .interpolate(this.interpolation)
                .x((d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); })
                .y((d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); });

            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie);

            var svgPath = svgSerie.append("path")
                .attr("class", "line")
                .attr("d", d3Line(this.data))
                .attr("stroke", this.color)
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add animation
            var duration = this.chart.settings.series.animate === true ? 1000 : 0;
            var pathLenght = svgPath[0][0].getTotalLength();

            svgPath
                .attr("stroke-dasharray", pathLenght + " " + pathLenght)
                .attr("stroke-dashoffset", pathLenght)
                .transition()
                .duration(duration)
                .attr("stroke-dashoffset", 0)
                .each("end", (): void => {
                    // draw markers
                    if (this.chart.settings.linechart.markers.enabled === true) {
                        var svgMarkers =  this.drawMarkers(svgSerie, this.serie);

                        // draw tooltip
                        this.chart.tooltip.draw(svgMarkers, this.serie);
                    }

                    // draw labels
                    if (this.chart.settings.series.labels.enabled === true && this.serie === this.chart.series.length - 1) {
                        this.chart.drawLabels(this.svg);
                    }
                });
        }

        private drawMarkers(svg: D3.Selection, serie: number): D3.Selection {
            var svgMarkers = svg.selectAll(".marker")
                .data(this.data)
                .enter()
                .append("path")
                .attr({
                    "class": "marker",
                    "stroke": ColorPalette.color(serie),
                    "stroke-width": 0,
                    "d": d3.svg.symbol()
                        .size(60)
                        .type(this.chart.series.items[serie].marker)(),
                    "transform": (d: any, i: number): string => {
                        return "translate(" + this.chart.getXCoordinate(d, i, this.serie) + ", " + this.chart.getYCoordinate(d, i, this.serie) + ")";
                    }
                });

            return svgMarkers;
        }

    }
}