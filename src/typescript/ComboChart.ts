/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class ComboChart extends XYChart {

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
        }

        public draw(): void {
            super.draw();

            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw lines
            for (var columnSerie = 0; columnSerie < this.series.length; columnSerie++) {
                if (this.series.items[columnSerie].type === "column") {
                    var column = new SVGColumn(svgSeries, this, columnSerie);
                    column.height = (d: any, i: number, s: number) => {
                        return this.getHeightColumn(d, i, s);
                    };
                    column.width = (d: any, i: number, s: number) => {
                        return this.getWidthColumn(d, i, s);
                    };
                    column.x = (d: any, i: number, s: number) => {
                        return this.getXCoordinateColumn(d, i, s);
                    };
                    column.y = (d: any, i: number, s: number) => {
                        return this.getYCoordinateColumn(d, i, s);
                    };
                    column.draw(this.series.getMatrixItem(columnSerie));
                }
            }

            for (var lineSerie = 0; lineSerie < this.series.length; lineSerie++) {
                if (this.series.items[lineSerie].type === "line") {
                    if (this.series.items[lineSerie].data.length != 0) {
                        var line = new SVGLine(svgSeries, this, lineSerie);
                        line.x = (d: any, i: number, s: number): number => {
                            return this.getXCoordinateLine(d, i, s);
                        };
                        line.y = (d: any, i: number, s: number): number => {
                            return this.getYCoordinateLine(d, i, s);
                        };
                        line.draw(this.series.getMatrixItem(lineSerie));
                    }
                }
            }
        }

        public getHeightColumn(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            return Math.abs(axis.scale(d.y) - this.axes[index].scale(0));
        }

        public getWidthColumn(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis.scale.rangeBand() / this.getColumnTotal();
            }
            else {
                return this.canvas.plotArea.width / this.getColumnTotal() / this.categories.length;
            }
        }

        public getXCoordinateColumn(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];
            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis.scale(axisScale) + (axis.scale.rangeBand() / this.getColumnTotal() * this.getCurrentColumn(serie));
            }
            else {
                return axis.scale(axisScale) + (this.canvas.plotArea.width / this.categories.length / this.getColumnTotal() * this.getCurrentColumn(serie));
            }
        }

        public getYCoordinateColumn(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (d.y < 0) {
                return axis.scale(d.y) - Math.abs(axis.scale(d.y) - this.axes[index].scale(0));
            }
            else {
                return axis.scale(d.y);
            }
        }

        public getXCoordinateLine(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis.scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
            }
            else {
                return axis.scale(this.categories.parseFormat(this.categories.getItem(i)));
            }
        }

        public getYCoordinateLine(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            return axis.scale(d.y);
        }

        public getY0CoordinateLine(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);

            return this.axes[index].scale(0);
        }

        private getCurrentColumn(serie: number): number {
            var count = -1;
            for (var i = 0; i < this.series.length; i++) {
                if (this.series.items[i].type === "column") {
                    count += 1;
                }
                if (i === serie) {
                    return count;
                }
            }
        }

        private getColumnTotal(): number {
            var count = 0;
            for (var i = 0; i < this.series.length; i++) {
                if (this.series.items[i].type === "column") {
                    count += 1;
                }
            }
            return count;
        }
    }
}