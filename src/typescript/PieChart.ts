/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class PieChart extends Chart {
        public innerRadius: number;

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.innerRadius = this.settings.piechart.innerRadius;
        }

        public draw(): void {
            super.draw();

            var radius = Math.min(this.canvas.plotArea.width / 2, this.canvas.plotArea.height / 2);
            var innerRadius = radius - radius * this.innerRadius;
            var serieRadius =  (radius - innerRadius) / this.series.length;

            for (var i = 0; i < this.series.length; i++) {

                var svgSeries = this.canvas.plotArea.svg.append("g")
                    .attr("id", "serie-" + i)
                    .attr("transform", "translate(" + (this.canvas.plotArea.width / 2) + "," + (this.canvas.plotArea.height / 2) + ")");

                var arc = d3.svg.arc()
                    .outerRadius(serieRadius * (i + 1) + innerRadius)
                    .innerRadius(innerRadius + (serieRadius * i)); // inner radius = 1 => pie chart

                var pie = d3.layout.pie();

                var arcs = svgSeries.selectAll("g.slice")
                    .data(pie(this.series.getSerie(i).getValues()))
                    .enter()
                    .append("g")
                    .attr("class", "slice");

                var path = arcs.append("path")
                    .attr("fill", (d: any, i: number): string => { return ColorPalette.getColor(i); })
                    .attr("d", arc);

                // draw tooltip
                this.tooltip.draw(path, i);
            }

            this.drawLabels(svgSeries)
        }

        // TODO - Labels on pie charts doesn't work
        public drawLabels(svg: D3.Selection): void {
            // draw data labels
            if (this.settings.series.showLabels == true) {
                for (var j = 0; j < this.series.length; j++) {
                    d3.selectAll("g#serie-" + j).selectAll(".slice")
                        .each(function(d: any): void {
                            svg.append("text")
                                .text(d.y) // TODO - should be d3.format(this.series.items[j].tooltipPointFormat)(d.y)
                                .style("text-anchor", "middle")
                                .attr({
                                    "class": "label",
                                    "alignment-baseline": "central",
                                    "fill": "#fff",
                                    "x": this.getAttribute("x"),
                                    "y": this.getAttribute("y"),
                                    "dx": Number(this.getAttribute("width")) / 2,
                                    "dy": (Number(this.getAttribute("height")) / 2)
                                });
                        });
                }
            }
        }
    }
}