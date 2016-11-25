/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class ScatterChart extends XYChart {

        private svgSeries: D3.Selection;

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
        }

        public draw(): void {
            super.draw();

            this.svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            for (var serie = 1; serie < this.series.length; serie++) {
                var bubbles = new SVGBubble(this.svgSeries, this, serie);
                bubbles.x = (d: any, i: number, s: number) => {
                    return this.getXCoordinate(d, i, s);
                };
                bubbles.y = (d: any, i: number, s: number) => {
                    return this.getYCoordinate(d, i, s);
                };
                bubbles.draw(this.series.getMatrixItem(0));
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
            var min = d3.min(this.series.items[0].data);
            var max = d3.max(this.series.items[0].data);
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