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
                    if (this.chart.settings.series.labels.enabled === true && this.serie === this.chart.series.length - 1) {
                        this.drawLabels(this.svg);
                    }
                });
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.chart.series.length; serie++) {
                var svgLabels = svg.append("g").attr("id", "labels-" + serie);
                d3.selectAll("g#serie-" + serie).selectAll("circle")
                    .each((d: any, i: number): void => {
                        var rotation = 0;
                        var x = this.chart.getXCoordinate(d, i, serie);
                        var y = this.chart.getYCoordinate(d, i, serie);
                        var dx = 0;
                        var dy = 0;

                        if (this.chart.settings.series.labels.rotate === true) {
                            rotation = -90;
                        }

                        var text = svgLabels.append("text")
                            .text(d3.format(this.chart.series.items[serie].format)(d.y))
                            .style("text-anchor", "middle")
                            .attr({
                                "alignment-baseline": "central",
                                "class": "label",
                                "fill": "#fff",
                                "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                            });

                        if (rotation != 0) {
                            dx = Html.getHeight(text);
                        }
                        else {
                            dy = -Html.getHeight(text);
                        }

                        text
                            .attr("dy", dy)
                            .attr("dx", dx);
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