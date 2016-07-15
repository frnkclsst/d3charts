/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedPercentBarChart extends StackedBarChart {

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

        public getWidth(serie: number): any {
            return (d: any): any => {
                return Math.abs((this.xAxis.scale(1) - this.xAxis.scale(0)) * d.perc);
            };
        }

        public normalizer(d: any): number {
            return this.xAxis.scale.domain()[1] / d.max;
        }
    }
}