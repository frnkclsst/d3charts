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
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return Math.abs(this.axes[index].scale(d.y) - this.axes[index].scale(0));
        }

        public getWidth(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            if (this.axes[index].getScaleType() === ScaleType.Ordinal) {
                return this.axes[index].scale.rangeBand() / this.series.length;
            }
            else {
                return this.canvas.width / this.series.length / this.categories.length;
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);
            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (this.axes[index].getScaleType() === ScaleType.Ordinal) {
                return this.axes[index].scale(axisScale) + (this.axes[index].scale.rangeBand() / this.series.length * serie);
            }
            else {
                return this.axes[index].scale(axisScale) + (this.canvas.width / this.series.length / this.categories.length * serie);
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            if (d.y < 0) {
                return this.axes[index].scale(d.y) - Math.abs(this.axes[index].scale(d.y) - this.axes[index].scale(0));
            }
            else {
                return this.axes[index].scale(d.y);
            }
        }
    }
}