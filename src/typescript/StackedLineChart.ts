"use strict";

import { AxisType, ScaleType, StackType} from "./Enums";
import { IDatum, IChartData, IOptions } from "./IInterfaces";
import { LineChart } from "./LineChart";

export class StackedLineChart extends LineChart {

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);
        this.stackType = StackType.Normal;
    }

    public getXCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal || axis.getScaleType() === ScaleType.Linear) {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
        }
        else {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i))); // for time scales
        }
    }

    public getYCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        // negative numbers
        if (d.y0 < 0) {
            return axis.scale((d.sum + d.y) * this._normalizer(d, i, serie));
        }
        // positive numbers
        else {
            return axis.scale(d.sum * this._normalizer(d, i, serie));
        }
    }

    public getY0Coordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        // negative values
        if (d.y < 0) {
            return (axis.scale(d.sum * this._normalizer(d, i, serie)));
        }
        // positive values
        else {
            return (axis.scale((d.sum - d.y) * this._normalizer(d, i, serie)));
        }
    }

    public getY1Coordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.sum * this._normalizer(d, i, serie));
    }

    protected _normalizer(d: IDatum, i: number, serie: number): number {
        return StackType.Normal; // no normalization needed as this not 100% stacked
    }
}
