/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedPercentBarChart extends StackedBarChart {

        constructor(args: any, selector: string) {
            super(args, selector);
            this.stackType = StackType.Percent;
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