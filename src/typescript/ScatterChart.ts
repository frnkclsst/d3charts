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

            for (var serie = 1; serie < this.series.length; serie++) {
                var _self = this;
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + serie)
                    .selectAll("path")
                    .data(this.series.getMatrixItem(0))
                    .enter();

                svgSerie.append("path")
                    .each(function(d: any, i: number): void {
                        var size = _self.series.items[serie].size != undefined ? _self.series.items[serie].size[i] * 10 : 60;
                        d3.select(this)
                            .attr({
                                "class": "bubble",
                                "d": d3.svg.symbol()
                                    .size(size)
                                    .type(_self.series.items[serie - 1].marker)(),
                                "fill": ColorPalette.color(serie - 1)
                                "stroke": ColorPalette.color(serie - 1),
                                "stroke-width": 0,
                                "transform": "translate(" + _self.getXCoordinate(d, i, 0) + ", " + _self.getYCoordinate(d, i, serie) + ")"
                            });
                    });
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            return axis.scale(d.y);
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var data = this.series.getMatrixItem(serie);
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            return axis.scale(data[i].y);
        }

        public getXScale(axis: Axis): any {
            var min = this.series.items[0].min;
            var max = this.series.items[0].max;
            var start = this.canvas.plotArea.axisSize.left;
            var end =  this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

            axis.setScaleType(ScaleType.Linear);
            return d3.scale.linear()
                .domain([min < 0 ? min : 0, max])
                .nice() // adds additional ticks to add some whitespace
                .range([start, end]);
        }

        public getYScale(axis: Axis): any {
            var min = this.series.getMinValue(axis.name);
            var max = this.series.getMaxValue(axis.name);

            var start = this.canvas.plotArea.axisSize.top;
            var end = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

            axis.setScaleType(ScaleType.Linear);
            return d3.scale.linear()
                .domain([max, min < 0 ? min : 0])
                .nice() // adds additional ticks to add some whitespace
                .range([start, end]);
        }
    }
}