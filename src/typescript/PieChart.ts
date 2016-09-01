/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class PieChart extends Chart {
        public innerRadius: number;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.innerRadius = Number(this.settings.getValue("piechart.innerRadius", "0.9"));
        }

        public draw(): void {
            super.draw();

            var radius = Math.min(this.canvas.plotArea.width / 2, this.canvas.plotArea.height / 2);
            var innerRadius = radius - radius * this.innerRadius;
            var serieRadius =  (radius - innerRadius) / this.series.length;

            for (var s = 0; s < this.series.length; s++) {

                var g = this.canvas.plotArea.svg.append("g")
                    .attr("transform", "translate(" + (this.canvas.plotArea.width / 2) + "," + (this.canvas.plotArea.height / 2) + ")");

                var arc = d3.svg.arc()
                    .outerRadius(serieRadius * (s + 1) + innerRadius)
                    .innerRadius(innerRadius + (serieRadius * s)); // inner radius = 1 => pie chart

                var pie = d3.layout.pie();

                var arcs = g.selectAll("g.slice")
                    .data(pie(this.series.getSerie(s).getValues()))
                    .enter()
                    .append("g")
                    .attr("class", "slice");

                var path = arcs.append("path")
                    .attr("fill", (d: any, i: number): string => { return ColorPalette.getColor(i); })
                    .attr("d", arc);

                // draw tooltip
                this.tooltip.draw(path, s);
            }
        }
    }
}