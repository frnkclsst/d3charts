"use strict";

import { AxisType, ScaleType, StackType} from "./Enums";
import { IDatum, IChartData, IOptions } from "./IInterfaces";
import { BarChart } from "./BarChart";

export class StackedBarChart extends BarChart {

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);
        this.stackType = StackType.Normal;
    }

    public getHeight(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal || axis.getScaleType() === ScaleType.Linear) {
            return axis.scale.rangeBand();
        }
        else {
            return this.canvas.height / this.series.length / this.categories.length;
        }
    }

    public getWidth(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(0) - axis.scale(d.y));
    }

    public getXCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (d.perc < 0) {
            return axis.scale((d.sum + d.y) * this.normalizer(d, i, serie));
        }
        else {
            return axis.scale((d.sum - d.y) * this.normalizer(d, i, serie));
        }
    }

    public getYCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(this.categories.parseFormat(this.categories.getItem(i)));
    }

    public normalizer(d: IDatum, i: number, serie: number): number {
        return StackType.Normal; // no normalization needed as this not 100% stacked
    }
}
