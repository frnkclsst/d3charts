/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    // TODO - should extend from SVGShape
    export class SVGMarker {

        protected chart: Chart;
        protected serie: number;
        protected svg: D3.Selection;

        constructor(svg: D3.Selection, chart: Chart, serie: number) {
            this.chart = chart;
            this.serie = serie;
            this.svg = svg;
        }

        public draw(x: number, y: number): void {
            var _self = this;
            this.svg
                //.data([])
                //.enter()
                .append("path")
                .each(function(d: any, i: number): void {
                    d3.select(this)
                        .attr({
                            "class": "marker",
                            "d": d3.svg.symbol()
                                .size(60)
                                .type(_self.chart.series.items[i].marker)(),
                            "stroke": ColorPalette.color(i),
                            "stroke-width": 0,
                            "transform": "translate(" + x + ", " + y + ")"
                        });
                });
        }
    }
}