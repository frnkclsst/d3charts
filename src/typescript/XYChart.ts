"use strict";

import * as d3 from "d3";
import { AxisType, ScaleType } from "./Enums";
import { Axis, XAxis, YAxis } from "./Axis";
import { Chart } from "./Chart";
import { IDatum, IChartData, IOptions } from "./IInterfaces";

export class XYChart extends Chart {
    public axes: Axis[] = [];

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);

        for (var i = 0; i < this.options.xAxes.length; i++) {
            var xAxis = new XAxis(this, this.options.xAxes[i]);
            this.axes.push(xAxis);
        }

        for (var j = 0; j < this.options.yAxes.length; j++) {
            var yAxis = new YAxis(this, this.options.yAxes[j]);
            this.axes.push(yAxis);
        }

        // Overrides
        this.canvas.legendArea.items = this.series.getLabels();
    }

    public draw(): void {
        super.draw();

        if (this.hasData()) {
            for (var i = 0; i < this.axes.length; i++) {
                this.axes[i].setSize();
            }

            for (var j = 0; j < this.axes.length; j++) {
                this.axes[j].draw();
                if (this.axes.length > 1) {
                    this.axes[j].setColor(this.colorPalette.color(j));
                }
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

    public getXCoordinate(d: IDatum, i: number, serie: number): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public getYCoordinate(d: IDatum, i: number, serie: number): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public getY0Coordinate(d: IDatum, i: number, serie: number): number {
        // child classes are responsible for implementing this method
        return 0;
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
                .domain(d3.extent(this.categories.getLabels(), (d: string): Date => {
                    return d3.time.format(this.categories.format).parse(d);
                }))
                .nice() // adds additional ticks to add some whitespace
                .range([start, end]);
        }
    }

    public getYScale(axis: Axis): d3.scale.Linear<number, number> {
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
