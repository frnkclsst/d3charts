/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class StackedPercentLineChart extends StackedLineChart {

        constructor(selector: string, args: ISettings) {
            super(selector, args);
            this.stackType = StackType.Percent;
            for (var i = 0; i < this.yAxes.length; i++) {
                this.yAxes[i].labels.format = "%";
            }
        }

        protected normalizer(d: any): number {
            return this.yAxes[0].scale.domain()[0] / d.max;
        }
    }
}