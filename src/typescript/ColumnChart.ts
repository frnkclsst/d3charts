/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class ColumnChart extends XYChart {

        public draw(): void {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw columns
            for (var serie = 0; serie < this.series.length; serie++) {
                var column = new SVGColumn(svgSeries, this, serie);
                column.draw();
            }
        }

        public getHeight(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            return Math.abs(axis.scale(d.y) - this.axes[index].scale(0));
        }

        public getWidth(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis.scale.rangeBand() / this.series.length;
            }
            else {
                return this.canvas.plotArea.width / this.series.length / this.categories.length;
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];
            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis.scale(axisScale) + (axis.scale.rangeBand() / this.series.length * serie);
            }
            else {
                return axis.scale(axisScale) + (this.canvas.plotArea.width / this.series.length / this.categories.length * serie);
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (d.y < 0) {
                return axis.scale(d.y) - Math.abs(axis.scale(d.y) - this.axes[index].scale(0));
            }
            else {
                return axis.scale(d.y);
            }
        }
    }
}