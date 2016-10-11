/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class BarChart extends XYChart {

        public draw(): void {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw bars
            for (var serie = 0; serie < this.series.length; serie++) {
                var bar = new SVGBar(svgSeries, this, serie);
                bar.draw();

                /*
                bar.testDraw(function(d: any, i: number, s: number): number {
                   return _self.getHeight(d, i, s);
                }, 0, 0);
                */
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);
            var axis = this.axes[index];

            if (d.y < 0) {
                return Math.abs(axis.scale(d.y));
            }
            else {
                return axis.scale(0);
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);
            var axis = this.axes[index];
            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis.scale(axisScale) + (axis.scale.rangeBand() / this.series.length * serie);
            }
            else {
                return axis.scale(axisScale) + (this.canvas.width / this.series.length / this.categories.length / this.series.length * serie);
            }
        }

        public getHeight(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);
            var axis = this.axes[index];

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return Math.abs(axis.scale.rangeBand() / this.series.length);
            }
            else {
                // TODO - dived twice by series.length - is this correct?
                return Math.abs(this.canvas.width / this.series.length / this.categories.length / this.series.length);
            }
        }

        public getWidth(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);
            var axis = this.axes[index];

            return Math.abs(axis.scale(d.y) - axis.scale(0));
        }
    }
}