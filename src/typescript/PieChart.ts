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

            var svgSeries = this.canvas.plotArea.svg.append("g")
                                .attr("class", "series");

            for (var s = 0; s < this.series.length; s++) {

                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + s)
                    .attr("transform", "translate(" + (this.canvas.plotArea.width / 2) + "," + (this.canvas.plotArea.height / 2) + ")");

                var pie = d3.layout.pie();

                var arc = d3.svg.arc()
                    .outerRadius(serieRadius * (s + 1) + innerRadius)
                    .innerRadius(innerRadius + (serieRadius * s)); // inner radius = 1 => pie chart

                var arcs = svgSerie.selectAll("g.slice")
                    .data(pie(this.series.getSerie(s).getValues()))
                    .enter()
                    .append("g")
                    .attr("class", "slice");

                var path = arcs.append("path")
                    .attr("fill", (d: any, i: number): string => { return ColorPalette.getColor(i); })
                    .attr("d", arc);

                if (this.settings.series.showLabels === true) {
                    arcs.append("text")
                        .attr("class", "label")
                        .attr("alignment-baseline", "central")
                        .attr("transform", (d: any): string => {
                            d.innerRadius = innerRadius + (serieRadius * s);
                            d.outerRadius = innerRadius * (s + 1) + innerRadius;
                            return "translate(" + arc.centroid(d) + ")";
                        })
                        .text((d: any): void => {
                            return d.data;
                        })
                        .style("text-anchor", "middle");
                }

                // draw tooltip
                this.tooltip.draw(path, s);
            }
        }

        // TODO - Labels on pie charts doesn't work
        public drawLabels(svg: D3.Selection): void {

        }
    }
}