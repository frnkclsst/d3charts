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
            this.color = ColorPalette.color(serie);
            this.data = chart.series.getMatrixItem(serie);
            this.interpolation = chart.interpolation;
            this.serie = serie;
            this.showMarkers = chart.showMarkers;
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
                    if (this.showMarkers) {
                        var svgMarkers =  this.drawMarkers(svgSerie, this.serie);

                        // draw tooltip
                        this.chart.tooltip.draw(svgMarkers, this.serie);
                    }

                    // draw labels
                    if (this.chart.settings.series.showLabels === true && this.serie === this.chart.series.length - 1) {
                        this.drawLabels(this.svg);
                    }
                });
        }

        public drawLabels(svg: D3.Selection): void {
            var _self = this;
            for (var serie = 0; serie < this.chart.series.length; serie++) {
                var svgLabels = svg.append("g").attr("id", "labels-" + serie);
                d3.selectAll("g#serie-" + serie).selectAll("circle")
                    .each(function (d: any, i: number): void {
                        svgLabels.append("text")
                            .text(d3.format(_self.chart.series.items[serie].tooltipPointFormat)(d.y))
                            .style("text-anchor", "middle")
                            .attr({
                                "class": "label",
                                "alignment-baseline": "central",
                                "fill": "#fff",
                                "x": _self.chart.getXCoordinate(d, i, serie),
                                "y": _self.chart.getYCoordinate(d, i, serie),
                                "dx": Number(this.getAttribute("width")) / 2,
                                "dy": (Number(this.getAttribute("height")) / 2) - 12
                            });
                    });
            }
        }

        private drawMarkers(svg: D3.Selection, serie: number): D3.Selection {
            var svgMarkers = svg.selectAll(".marker")
                .data(this.data)
                .enter().append("circle")
                .attr("class", "marker")
                .attr("stroke", ColorPalette.color(serie))
                .attr("stroke-width", "0")
                .attr("fill", ColorPalette.color(serie))
                .attr("cx", (d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); })
                .attr("cy", (d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); })
                .attr("r", 4);

            return svgMarkers;
        }

    }
}