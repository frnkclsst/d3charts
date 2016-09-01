/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedBarChart extends BarChart {

        constructor(args: any, selector: string) {
            super(args, selector);
            this.stackType = StackType.Normal;
        }

        public getHeight(serie: number): any {
            return (d: any): any => {
                if (this.yAxes[0].getScaleType() == ScaleType.Ordinal || this.yAxes[0].getScaleType() == ScaleType.Linear) {
                    return this.yAxes[0].scale.rangeBand();
                }
                else {
                    return this.canvas.height / this.series.length / this.categories.length;
                }
            };
        }

        public getWidth(serie: number): any {
            return (d: any): any => {
                return Math.abs(this.xAxes[0].scale(0) - this.xAxes[0].scale(d.y));
            };
        }

        public getXCoordinate(serie: number): any {
            return (d: any): any => {
                if (d.perc < 0) {
                    return this.xAxes[0].scale((d.y0 + d.y) * this.normalizer(d));
                }
                else {
                    return this.xAxes[0].scale((d.y0 - d.y) * this.normalizer(d));
                }
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any, i: number): any => {
                return this.yAxes[0].scale(this.categories.parseFormat(this.categories.getItem(i)));
            };
        }

        public normalizer(d: any): number {
            return 1; // no normalization needed as this not 100% stacked
        }
    }
}