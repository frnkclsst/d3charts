/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedLineChart extends LineChart {

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.stackType = StackType.Normal;
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            if (this.xAxes[0].getScaleType() == ScaleType.Ordinal || this.xAxes[0].getScaleType() == ScaleType.Linear) {
                return this.xAxes[0].scale(this.categories.parseFormat(this.categories.getItem(i))) + this.xAxes[0].scale.rangeBand() / 2;
            }
            else {
                return this.xAxes[0].scale(this.categories.parseFormat(this.categories.getItem(i))); // for time scales
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            // negative numbers
            if (d.y0 < 1) {
                return this.yAxes[0].scale((d.y0 + d.y) * this.normalizer(d));
            }
            // positive numbers
            else {
                return this.yAxes[0].scale(d.y0 * this.normalizer(d));
            }
        }

        public getY0Coordinate(d: any, i: number, serie: number): any {
            // negative values
            if (d.y < 0) {
                return (this.yAxes[0].scale(d.y0 * this.normalizer(d)));
            }
            // positive values
            else {
                return (this.yAxes[0].scale((d.y0 - d.y) * this.normalizer(d)));
            }
        }

        protected normalizer(d: any): number {
            return StackType.Normal;
        }
    }
}