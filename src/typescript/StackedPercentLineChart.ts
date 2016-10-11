/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class StackedPercentLineChart extends StackedLineChart {

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
            this.stackType = StackType.Percent;
            for (var i = 0; i < this.axes.length; i++) {
                if (this.axes[i] instanceof YAxis) {
                    this.axes[i].labels.format = "%";
                }
            }
        }

        protected normalizer(d: any, serie: number): number {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);
            var axis = this.axes[index];

            return axis.scale.domain()[0] / d.max;
        }
    }
}