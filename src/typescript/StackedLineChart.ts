/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class StackedLineChart extends LineChart {

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
            this.stackType = StackType.Normal;
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (axis.getScaleType() === ScaleType.Ordinal || axis.getScaleType() === ScaleType.Linear) {
                return axis.scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
            }
            else {
                return axis.scale(this.categories.parseFormat(this.categories.getItem(i))); // for time scales
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            // negative numbers
            if (d.y0 < 1) {
                return axis.scale((d.y0 + d.y) * this.normalizer(d, serie));
            }
            // positive numbers
            else {
                return axis.scale(d.y0 * this.normalizer(d, serie));
            }
        }

        public getY0Coordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            // negative values
            if (d.y < 0) {
                return (axis.scale(d.y0 * this.normalizer(d, serie)));
            }
            // positive values
            else {
                return (axis.scale((d.y0 - d.y) * this.normalizer(d, serie)));
            }
        }

        protected normalizer(d: any, serie: number): number {
            return StackType.Normal; // no normalization needed as this not 100% stacked
        }
    }
}