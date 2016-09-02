/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedColumnChart extends ColumnChart {

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.stackType = StackType.Normal;
        }

        public getHeight(serie: number): any {
            return (d: any): any => {
                return  Math.abs(this.yAxes[0].scale(0) - this.yAxes[0].scale(d.y));
            };
        }

        public getWidth(serie: number): any {
            return (d: any): any => {
                if (this.xAxes[0].getScaleType() == ScaleType.Ordinal || this.xAxes[0].getScaleType() == ScaleType.Linear) {
                    return this.xAxes[0].scale.rangeBand();
                }
                else {
                    return this.canvas.width / this.series.length / this.categories.length; //did it to support time scales
                }
            };
        }

        public getXCoordinate(serie: number): any {
            return (d: any, i: number): any => {
                return this.xAxes[0].scale(this.categories.parseFormat(this.categories.getItem(i)));
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any): any => {
                return this.yAxes[0].scale(d.y0 * this.normalizer(d));
            };
        }

        public normalizer(d: any): number {
            return StackType.Normal;
        }
    }
}