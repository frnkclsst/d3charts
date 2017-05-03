"use strict";

import { AxisType, ScaleType } from "./Enums";
import { IData, IOptions } from "./IOptions";
import { Chart } from "./Chart";
import { Axis, XAxis, YAxis } from "./Axis";

export class XYChart extends Chart {
    public axes: Axis[] = [];

    constructor(selector: string, data: IData, options?: IOptions) {
        super(selector, data, options);

        for (var i = 0; i < this.options.xAxes.length; i++) {
            var xAxis = new XAxis(this, this.options.xAxes[i]);
            this.axes.push(xAxis);
        }

        for (var j = 0; j < this.options.yAxes.length; j++) {
            var yAxis = new YAxis(this, this.options.yAxes[j]);
            this.axes.push(yAxis);
        }
    }

    public draw(): void {
        super.draw();

        for (var i = 0; i < this.axes.length; i++) {
            this.axes[i].getSize();
        }

        for (var j = 0; j < this.axes.length; j++) {
            this.axes[j].draw();
            if (this.axes.length > 1) {
                this.axes[j].setColor(this.colorPalette.color(j));
            }
        }
    }

    public getAxisByName(axisType: AxisType, ref: string): number {
        var last = -1;
        if (ref != "") {
            for (var i = 0; i <  this.axes.length; i++) {
                if (this.axes[i].type === axisType) {
                    last = i;
                    if (this.axes[i].name === ref) {
                        return i;
                    }
                }
            }
        }
        return last;
    }

    public getXCoordinate(d: any, i: number, serie: number): any {
        // child classes are responsible for implementing this method
    }

    public getYCoordinate(d: any, i: number, serie: number): any {
        // child classes are responsible for implementing this method
    }

    public getY0Coordinate(d: any, i: number, serie: number): any {
        // child classes are responsible for implementing this method
    }

    public getXScale(axis: Axis): any {
        var start = this.canvas.plotArea.axisSize.left;
        var end =  this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

        if (this.categories.format === "%s") {
            axis.setScaleType(ScaleType.Ordinal);
            return d3.scale.ordinal()
                .domain(this.categories.getLabels())
                .rangeBands([start, end], this.options.plotOptions.bands.innerPadding, this.options.plotOptions.bands.outerPadding);
        }
        else {
            axis.setScaleType(ScaleType.Time);
            return d3.time.scale()
                .domain(d3.extent(this.categories.getLabels(), (d: any): Date => {
                    return d3.time.format(this.categories.format).parse(d);
                }))
                .nice() // adds additional ticks to add some whitespace
                .range([start, end]);
        }
    }

    public getYScale(axis: Axis): any {
        var min = this.series.min(axis.name);
        var max = this.series.max(axis.name);

        var start = this.canvas.plotArea.axisSize.top;
        var end = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

        axis.setScaleType(ScaleType.Linear);
        return d3.scale.linear()
            .domain([max, min < 0 ? min : 0])
            .nice() // adds additional ticks to add some whitespace
            .range([start, end]);
    }
}