/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGLine extends SVGShape {
        protected chart: XYChart;

        public x: (d: any, i: number, serie: number) => number;
        public y: (d: any, i: number, serie: number) => number;

        constructor(svg: D3.Selection, chart: XYChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
            this.x = null;
            this.y = null;
        }

        public draw(data: any): void {
            var line = d3.svg.line()
                .interpolate(this.chart.options.plotArea.line.interpolation)
                .x((d: any, i: number): number => { return this.x(d, i, this.serie); })
                .y((d: any, i: number): number => { return this.y(d, i, this.serie); });

            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + this.serie);

            var svgPath = svgSerie.append("path")
                .attr("class", "line")
                .attr("d", line(data))
                .attr("stroke", this.chart.colorPalette.color(this.serie))
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add animation
            var pathLenght = svgPath[0][0].getTotalLength();
            var count = 0;
            svgPath
                .each((): void => {
                    count++; // count number of bars
                })
                .attr("stroke-dasharray", pathLenght + " " + pathLenght)
                .attr("stroke-dashoffset", pathLenght)
                .transition()
                .duration(this.chart.options.plotArea.animation.duration)
                .ease(this.chart.options.plotArea.animation.ease)
                .attr("stroke-dashoffset", 0)
                .each("end", (): void => {
                    count--;
                    // draw markers
                    if (this.chart.options.plotArea.markers.visible === true) {
                        var svgMarkers =  this.drawMarkers();

                        // draw tooltip
                        this.chart.tooltip.draw(svgMarkers, this.serie);
                    }

                    // draw labels
                    if (this.chart.options.series.labels.visible === true && !count) {
                        this.drawLabels();
                    }
                });
        }

        public drawLabels(): void {
            this.svgLabels = this.svg.append("g")
                .attr("id", "labels-" + this.serie)
                .attr("opacity", "1");

            d3.selectAll("g#serie-" + this.serie).selectAll("path.marker")
                .each((d: any, i: number): void => {
                    var rotation = 0;
                    var x = this.x(d, i, this.serie);
                    var y = this.y(d, i, this.serie);
                    var dx = 0;
                    var dy = 0;

                    if (this.chart.options.series.labels.rotate === true) {
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
                        dx = Html.getHeight(text) + this.chart.options.plotArea.markers.size / 2;
                    }
                    else {
                        dy = -Html.getHeight(text) - this.chart.options.plotArea.markers.size / 2;
                    }

                    text
                        .attr("dy", dy)
                        .attr("dx", dx);
                });
        }

        public drawMarkers(): D3.Selection {
            return this.svg.selectAll("g#serie-" + this.serie).selectAll(".marker")
                .data(this.chart.series.getMatrixItem(this.serie))
                .enter()
                .append("path")
                .attr({
                    "class": "marker",
                    "stroke": this.chart.colorPalette.color(this.serie),
                    "stroke-width": 0,
                    "d": d3.svg.symbol()
                        .size(this.chart.options.plotArea.markers.size * 10)
                        .type(this.chart.series.items[this.serie].marker)(),
                    "transform": (d: any, i: number): string => {
                        return "translate(" + this.x(d, i, this.serie) + ", " + this.y(d, i, this.serie) + ")";
                    }
                });
        }
    }
}