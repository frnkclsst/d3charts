/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGMarker {
        private _chart: Chart;
        private _svg: D3.Selection;

        constructor(svg: D3.Selection, chart: Chart) {
            this._chart = chart;
            this._svg = svg;
        }

        public draw(x: number, y: number): void {
            var _self = this;
            this._svg
                //.data([])
                //.enter()
                .append("path")
                .each(function(d: any, i: number): void {
                    d3.select(this)
                        .attr({
                            "class": "marker",
                            "d": d3.svg.symbol()
                                .size(60)
                                .type(_self._chart.series.items[i].marker)(),
                            "stroke": ColorPalette.color(i),
                            "stroke-width": 0,
                            "transform": "translate(" + x + ", " + y + ")"
                        });
                });
        }
    }
}