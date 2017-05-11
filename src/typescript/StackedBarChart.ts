"use strict";

import { AxisType, ScaleType, StackType} from "./Enums";
import { IData, IOptions } from "./IOptions";
import { BarChart } from "./BarChart";

export class StackedBarChart extends BarChart {

    constructor(selector: string, data: IData, options?: IOptions) {
        super(selector, data, options);
        this.stackType = StackType.Normal;
    }

    public getHeight(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal || axis.getScaleType() === ScaleType.Linear) {
            return axis.scale.rangeBand();
        }
        else {
            return this.canvas.height / this.series.length / this.categories.length;
        }
    }

    public getWidth(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(0) - axis.scale(d.y));
    }

    public getXCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (d.perc < 0) {
            return axis.scale((d.sum + d.y) * this.normalizer(d, i, serie));
        }
        else {
            return axis.scale((d.sum - d.y) * this.normalizer(d, i, serie));
        }
    }

    public getYCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(this.categories.parseFormat(this.categories.getItem(i)));
    }

    public normalizer(d: any, i: number, serie: number): number {
        return StackType.Normal; // no normalization needed as this not 100% stacked
    }
}