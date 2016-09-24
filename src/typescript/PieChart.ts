/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class PieChart extends Chart {
        private arcs: any[] = [];
        private innerRadiusPercentage: number;
        private innerRadius: number;
        private radius: number;
        private serieRadius: number;

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.innerRadiusPercentage = this.settings.piechart.innerRadius;
        }

        public draw(): void {
            super.draw();

            var _self = this;

            this.radius = Math.min(this.canvas.plotArea.width / 2, this.canvas.plotArea.height / 2);
            this.innerRadius = this.radius - (this.radius * this.innerRadiusPercentage);
            this.serieRadius =  (this.radius - this.innerRadius) / this.series.length;

            var svgSeries = this.canvas.plotArea.svg.append("g")
                    .attr("class", "series")
                    .attr("transform", "translate(" + (this.canvas.plotArea.width / 2) + "," + (this.canvas.plotArea.height / 2) + ")");

            for (var serie = 0; serie < this.series.length; serie++) {
                var d3Pie = d3.layout.pie()
                    .sort(null);

                var d3Arc = d3.svg.arc()
                    .innerRadius(this.innerRadius + (this.serieRadius * serie)) // inner radius = 1 => pie chart
                    .outerRadius(this.serieRadius * (serie + 1) + this.innerRadius);
                this.arcs.push(d3Arc);

                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + serie);

                var svgArcs = svgSerie.selectAll("g.slice")
                    .data(d3Pie(this.series.getSerie(serie).getValues()))
                    .enter()
                    .append("g")
                    .attr("class", "slice");

                // draw arcs
                var svgPath = svgArcs.append("path")
                    .attr("fill", (d: any, i: number): string => { return ColorPalette.color(i); })
                    .attr("data-serie", serie)
                    .attr("d", function (d: any): any {
                        console.log(this);
                        return d3Arc(d);
                    });

                // add animation
                var duration = this.settings.series.animate === true ? 1000 : 0;
                var count = 0;
                svgPath
                    .each((): void => {
                        count++;
                    })
                    .transition()
                    .duration(duration)
                    .attrTween("d", function (d: any, i: number): any {
                        var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                        var s = this.getAttribute("data-serie");
                        var arc = _self.arcs[s];
                        return (t: any): any => {
                            d.endAngle = interpolate(t);
                            return arc(d);
                        };
                    })
                    .each("end", (): void => {
                        count--;
                        if (this.settings.series.showLabels === true && !count) {
                            this.drawLabels(svgSeries);
                        }
                    });

                // draw tooltip
                this.tooltip.draw(svgPath, serie);
            }
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.series.length; serie++) {
                d3.selectAll("g#serie-" + serie).selectAll(".slice")
                    .each((d: any, i: number): void  => {
                        svg.append("text")
                            .style("text-anchor", "middle")
                            .attr({
                                "alignment-baseline": "central",
                                "class": "label",
                                "fill": "#fff",
                                "transform": (): string => {
                                    return "translate(" + this.arcs[serie].centroid(d) + ")";
                                }
                            })
                            .text(d3.format(this.series.items[serie].tooltipPointFormat)(d.data));
                    });
            }
        }
    }
}