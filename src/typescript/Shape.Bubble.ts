/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGBubble extends SVGShape {

        protected chart: XYChart;

        public x: (d: any, i: number, serie: number) => number;
        public y: (d: any, i: number, serie: number) => number;

        constructor(svg: D3.Selection, chart: XYChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
        }

        public draw(data: any): void {
            var _self = this;

            var svgSerie = this.svg.append("g")
                .attr("id", "serie-" + (this.serie - 1))
                .selectAll("path")
                .data(data)
                .enter();

            var svgBubbles = svgSerie.append("path")
                .each(function(d: any, i: number): void {
                    d3.select(this)
                        .attr({
                            "class": "bubble",
                            "d": d3.svg.symbol()
                                .size(0)
                                .type(_self.chart.series.items[_self.serie - 1].marker)(),
                            "fill": _self.chart.colorPalette.color(_self.serie - 1),
                            "stroke": _self.chart.colorPalette.color(_self.serie - 1),
                            "stroke-width": 0,
                            "transform": "translate(" + _self.x(d, i, 0) + ", " + _self.y(d, i, _self.serie) + ")"
                        });
                });

            // add animation
            var count = 0;
            svgBubbles
                .each((): void => {
                    count++; // count number of bars
                })
                .transition()
                .duration(this.chart.options.plotOptions.animation.duration)
                .ease(this.chart.options.plotOptions.animation.ease)
                .attr("d", (d: any, i: number): any => {
                    var size = _self.chart.series.items[this.serie].size != undefined ? _self.chart.series.items[this.serie].size[i] * 10 : 60;
                    return d3.svg.symbol()
                        .size(size)
                        .type(_self.chart.series.items[this.serie - 1].marker)();
                })
                .each("end", (): void => {
                    count--;
                    if (this.chart.options.series.labels.visible === true && !count) { // only draw labels after all transitions ended
                        this.drawLabels();
                    }
                });

            // draw tooltip
            this.chart.tooltip.draw(svgBubbles, this.serie);
        }

        public drawLabels(): void {
            this.svgLabels = this.svg.append("g")
                .attr("id", "labels-" + (this.serie - 1))
                .attr("opacity", "1");

            d3.selectAll("g#serie-" + (this.serie - 1)).selectAll("path.bubble")
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
                        .text(d3.format(this.chart.series.items[this.serie].format)(this.chart.series.items[this.serie].data[i]))
                        .style("text-anchor", "middle")
                        .attr({
                            "alignment-baseline": "central",
                            "class": "label",
                            "fill": "#fff",
                            "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                        });

                    text
                        .attr("dy", dy)
                        .attr("dx", dx);
                });
        }

    }
}