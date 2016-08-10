/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedPercentColumnChart extends StackedColumnChart {

        constructor(args: any, selector: string) {
            super(args, selector);
            this.stackType = StackType.Percent;
        }

        public getHeight(serie: number): any {
            return (d: any): any => {
                return Math.abs(this.yAxes[0].scale(this.yAxes[0].scale.domain()[0] - d.perc));
            };
        }

        public normalizer(d: any): number {
            return this.yAxes[0].scale.domain()[0] / d.max;
        }
    }
}