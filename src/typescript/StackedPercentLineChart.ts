/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedPercentLineChart extends StackedLineChart {

        constructor(settings: ISettings, selector: string) {
            super(settings, selector);
            this.stackType = StackType.Percent;
        }

        protected normalizer(d: any): number {
            return this.yAxes[0].scale.domain()[0] / d.max;
        }
    }
}