/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class StackedPercentColumnChart extends StackedColumnChart {

        constructor(selector: string, args: ISettings) {
            super(selector, args);
            this.stackType = StackType.Percent;
            for (var i = 0; i < this.yAxes.length; i++) {
                this.yAxes[i].labels.format = "%";
            }
        }

        public getHeight(d: any, i: number, serie: number): any {
            return Math.abs((this.yAxes[0].scale(1) - this.yAxes[0].scale(0)) * d.perc);
        }

        public normalizer(d: any): number {
            return this.yAxes[0].scale.domain()[0] / d.max;
        }
    }
}