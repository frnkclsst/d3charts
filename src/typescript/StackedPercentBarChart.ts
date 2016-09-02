/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedPercentBarChart extends StackedBarChart {

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.stackType = StackType.Percent;
        }

        public getWidth(serie: number): any {
            return (d: any): any => {
                return Math.abs((this.xAxes[0].scale(1) - this.xAxes[0].scale(0)) * d.perc);
            };
        }

        public normalizer(d: any): number {
            return this.xAxes[0].scale.domain()[1] / d.max;
        }
    }
}