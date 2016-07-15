/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedPercentLineChart extends StackedLineChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        protected normalizer(d: any): number {
            return this.yAxis.scale.domain()[0] / d.max;
        }
    }
}