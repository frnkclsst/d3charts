/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class StackedPercentColumnChart extends StackedColumnChart {

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
            this.stackType = StackType.Percent;
            for (var i = 0; i < this.axes.length; i++) {
                if (this.axes[i] instanceof YAxis) {
                    this.axes[i].labels.format = "%";
                }
            }
        }

        public getHeight(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);
            var axis = this.axes[index];

            return Math.abs((axis.scale(1) - axis.scale(0)) * d.perc);
        }

        public normalizer(d: any, serie: number): number {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);
            var axis = this.axes[index];

            return axis.scale.domain()[0] / d.max;
        }
    }
}