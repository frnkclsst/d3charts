/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedBarChart extends BarChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        public getXCoordinate(serie: number): any {
            return (d: any): any => {
                if (d.perc < 0) {
                    return this.xAxis.scale((d.y0 + d.y) * this.normalizer(d));
                }
                else {
                    return this.xAxis.scale((d.y0 - d.y) * this.normalizer(d));
                }
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any, i: number): any => {
                return this.yAxis.scale(this.categories.parseFormat(this.categories.getItem(i)));
            };
        }

        public getHeight(serie: number): any {
            return (d: any): any => {
                if (this.yAxis.isOrdinalScale() || this.yAxis.isLinearScale()) {
                    return this.yAxis.scale.rangeBand();
                }
                else {
                    return this.canvas.height / this.series.length / this.categories.length;
                }
            };
        }

        public getWidth(serie: number): any {
            return (d: any): any => {
                return Math.abs(this.xAxis.scale(0) - this.xAxis.scale(d.y));
            };
        }

        public normalizer(d: any): number {
            return 1; // no normalization needed as this not 100% stacked
        }
    }
}