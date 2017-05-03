"use strict";

import { AxisType, ScaleType, StackType} from "./Enums";
import { IData, IOptions } from "./IOptions";
import { LineChart } from "./LineChart";

export class StackedLineChart extends LineChart {

    constructor(selector: string, data: IData, options?: IOptions) {
        super(selector, data, options);
        this.stackType = StackType.Normal;
    }

    public getXCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal || axis.getScaleType() === ScaleType.Linear) {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
        }
        else {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i))); // for time scales
        }
    }

    public getYCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        // negative numbers
        if (d.y0 < 0) {
            return axis.scale((d.sum + d.y) * this.normalizer(d, i, serie));
        }
        // positive numbers
        else {
            return axis.scale(d.sum * this.normalizer(d, i, serie));
        }
    }

    public getY0Coordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        // negative values
        if (d.y < 0) {
            return (axis.scale(d.sum * this.normalizer(d, i, serie)));
        }
        // positive values
        else {
            return (axis.scale((d.sum - d.y) * this.normalizer(d, i, serie)));
        }
    }

    public getY1Coordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.sum * this.normalizer(d, i, serie));
    }

    protected normalizer(d: any, i: number, serie: number): number {
        return StackType.Normal; // no normalization needed as this not 100% stacked
    }
}