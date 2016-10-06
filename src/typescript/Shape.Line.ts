/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGLine extends SVGShape {
        protected chart: LineChart;

        constructor(svg: D3.Selection, chart: LineChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
        }

        public draw(): void {
            var d3Line = d3.svg.line()
                .interpolate(this.chart.interpolation)
                .x((d: any, i: number): number => { return this.chart.getXCoordinate(d, i, this.serie); })
                .y((d: any, i: number): number => { return this.chart.getYCoordinate(d, i, this.serie); });

            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie);

            var svgPath = svgSerie.append("path")
                .attr("class", "line")
                .attr("d", d3Line(this.chart.series.getMatrixItem(this.serie)))
                .attr("stroke", ColorPalette.color(this.serie))
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add animation
            var duration = this.chart.settings.series.animate === true ? 1000 : 0;
            var pathLenght = svgPath[0][0].getTotalLength();
            var count = 0;
            svgPath
                .each((): void => {
                    count++; // count number of bars
                })
                .attr("stroke-dasharray", pathLenght + " " + pathLenght)
                .attr("stroke-dashoffset", pathLenght)
                .transition()
                .duration(duration)
                .attr("stroke-dashoffset", 0)
                .each("end", (): void => {
                    count--;
                    // draw markers
                    if (this.chart.settings.linechart.markers.enabled === true) {
                        var svgMarkers =  this.drawMarkers();

                        // draw tooltip
                        this.chart.tooltip.draw(svgMarkers, this.serie);
                    }

                    // draw labels
                    if (this.chart.settings.series.labels.enabled === true && !count) {
                        this.drawLabels();
                        this.showLabels();
                    }
                });
        }

        public drawLabels(): void {
            super.drawLabels();
            d3.selectAll("g#serie-" + this.serie).selectAll("path.marker")
                .each((d: any, i: number): void => {
                    var rotation = 0;
                    var x = this.chart.getXCoordinate(d, i, this.serie);
                    var y = this.chart.getYCoordinate(d, i, this.serie);
                    var dx = 0;
                    var dy = 0;

                    if (this.chart.settings.series.labels.rotate === true) {
                        rotation = -90;
                    }

                    var text = this.svgLabels.append("text")
                        .text(d3.format(this.chart.series.items[this.serie].format)(d.y))
                        .style("text-anchor", "middle")
                        .attr({
                            "alignment-baseline": "central",
                            "class": "label",
                            "fill": "#fff",
                            "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                        });

                    if (rotation != 0) {
                        dx = Html.getHeight(text) + this.chart.settings.linechart.markers.size / 2;
                    }
                    else {
                        dy = -Html.getHeight(text) - this.chart.settings.linechart.markers.size / 2;
                    }

                    text
                        .attr("dy", dy)
                        .attr("dx", dx);
                });
        }

        public drawMarkers(): D3.Selection {
            var svgMarkers = this.svg.selectAll("g#serie-" + this.serie).selectAll(".marker")
                .data(this.chart.series.getMatrixItem(this.serie))
                .enter()
                .append("path")
                .attr({
                    "class": "marker",
                    "stroke": ColorPalette.color(this.serie),
                    "stroke-width": 0,
                    "d": d3.svg.symbol()
                        .size(this.chart.settings.linechart.markers.size * 10)
                        .type(this.chart.series.items[this.serie].marker)(),
                    "transform": (d: any, i: number): string => {
                        return "translate(" + this.chart.getXCoordinate(d, i, this.serie) + ", " + this.chart.getYCoordinate(d, i, this.serie) + ")";
                    }
                });

            return svgMarkers;
        }

    }
}