/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class ScatterChart extends XYChart {

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
        }

        public draw(): void {
            super.draw();

            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw markers
            var svgSerie = svgSeries.append("g")
                .attr("id", "serie-" + 0)
                .selectAll("path")
                .data(this.series.getMatrixItem(0))
                .enter();

            var _self = this;
            svgSerie.append("path")
                .each(function(d: any, i: number): void {
                    console.log(d);
                    d3.select(this)
                        .attr({
                            "class": "marker",
                            "d": d3.svg.symbol()
                                .size(60)
                                .type("circle")(),
                            "stroke": ColorPalette.color(0),
                            "stroke-width": 0,
                            "transform": "translate(" + _self.getXCoordinate(d, i, 0) + ", " + _self.getYCoordinate(d, i, 1) + ")"
                        });
                });
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);
            var axis = this.axes[index];

            return axis.scale(d.y);
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var data = this.series.getMatrixItem(1);
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);
            var axis = this.axes[index];

            return axis.scale(data[i].y);
        }
    }
}