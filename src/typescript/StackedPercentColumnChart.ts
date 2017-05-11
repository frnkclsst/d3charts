"use strict";

import { AxisType, ScaleType, StackType } from "./Enums";
import { IData, IOptions } from "./IOptions";
import { Axis, YAxis } from "./Axis";
import { StackedColumnChart } from "./StackedColumnChart";

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
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs((axis.scale(1) - axis.scale(0)) * d.perc);
    }

    public getYScale(axis: Axis): any {
        var min = this.series.min(name);

        var start = this.canvas.plotArea.axisSize.top;
        var end = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

        axis.setScaleType(ScaleType.Linear);
        return d3.scale.linear()
            .domain([1, min < 0 ? -1 : 0])
            .range([start, end]);
    }

    public normalizer(d: any, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale.domain()[0] / d.max;
    }
}