/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedColumnChart extends ColumnChart {

        constructor(args: any, selector: string) {
            super(args, selector);
            this.stackType = StackType.Normal;
        }

        public getXCoordinate(serie: number): any {
            return (d: any, i: number): any => {
                return this.xAxis.scale(this.categories.parseFormat(this.categories.getItem(i)));
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any): any => {
                return this.yAxis.scale(d.y0 * this.normalizer(d));
            };
        }

        public getHeight(serie: number): any {
            return (d: any): any => {
                return  Math.abs(this.yAxis.scale(0) - this.yAxis.scale(d.y));
            };
        }

        public getWidth(serie: number): any {
            return (d: any): any => {
                if (this.xAxis.isOrdinalScale() || this.xAxis.isLinearScale()) {
                    return this.xAxis.scale.rangeBand();
                }
                else {
                    return this.canvas.width / this.series.length / this.categories.length; //did it to support time scales
                }
            };
        }

        public normalizer(d: any): number {
            return StackType.Normal;
        }
    }
}