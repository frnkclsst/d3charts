"use strict";

import * as d3 from "d3";
import { AxisType, ScaleType } from "./Enums";
import { Axis } from "./Axis";
import { XYChart } from "./XYChart";
import { BarShape } from "./Shape.Bar";
import { IDatum, IChartData, IOptions } from "./IInterfaces";

export class BarChart extends XYChart {

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);

        // Overrides
        for (var i: number = 0; i < this.axes.length; i++) {
            this.axes[i].isDataAxis = (this.axes[i].type === AxisType.X);
        }
    }

    public draw(): void {
        super.draw();

        if (this.hasData()) {
            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw bars
            for (var serie = 0; serie < this.series.length; serie++) {
                var bar = new BarShape(svgSeries, this, serie);

                bar
                    .animation(
                        this.options.plotOptions.animation.duration,
                        this.options.plotOptions.animation.ease
                    )
                    .color(this.colorPalette.color(serie))
                    .height((d: IDatum, i: number, s: number) => {
                        return this.getHeight(d, i, s);
                    })
                    .labels(
                        this.series.items[serie].format,
                        this.options.series.labels.rotate,
                        this.options.series.labels.visible
                    )
                    .width((d: IDatum, i: number, s: number) => {
                        return this.getWidth(d, i, s);
                    })
                    .x((d: IDatum, i: number, s: number) => {
                        return this.getXCoordinate(d, i, s);
                    })
                    .y((d: IDatum, i: number, s: number) => {
                        return this.getYCoordinate(d, i, s);
                    })
                    .draw(this.series.getMatrixItem(serie));
            }
        }
    }

    public getXCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (d.y < 0) {
            return Math.abs(axis.scale(d.y));
        }
        else {
            return axis.scale(d.y0);
        }
    }

    public getYCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];
        var axisScale = this.categories.parseFormat(this.categories.getItem(i));

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale(axisScale) + (axis.scale.rangeBand() / this.series.length * serie);
        }
        else {
            return axis.scale(axisScale) + (this.canvas.plotArea.height / this.categories.length / this.series.length * serie);
        }
    }

    public getHeight(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return Math.abs(axis.scale.rangeBand() / this.series.length);
        }
        else {
            return Math.abs(this.canvas.plotArea.height / this.series.length / this.categories.length);
        }
    }

    public getWidth(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(d.y1) - axis.scale(d.y0));
    }

    public getXScale(axis: Axis): d3.scale.Linear<number, number> {
        var min = this.series.min(name);
        var max = this.series.max(name);

        var start = this.canvas.plotArea.axisSize.left;
        var end =  this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

        axis.setScaleType(ScaleType.Linear);
        return d3.scale.linear()
            .domain([min < 0 ? min : 0, max])
            .nice() // adds additional ticks to add some whitespace
            .range([start, end]);
    }

    public getYScale(axis: Axis): any {
        var min = this.series.min(name);

        var start = this.canvas.plotArea.axisSize.top;
        var end = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

        if (this.categories.format === "%s") {
            axis.setScaleType(ScaleType.Ordinal);
            return d3.scale.ordinal()
                .domain(this.categories.labels)
                .rangeRoundBands([start, end], this.options.plotOptions.bands.innerPadding, this.options.plotOptions.bands.outerPadding);
        }
        else {
            axis.setScaleType(ScaleType.Time);
            return d3.time.scale()
                .domain(d3.extent(this.categories.labels, (d: string): Date => {
                    return d3.time.format(this.categories.format).parse(d);
                }).reverse())
                .nice() // adds additional ticks to add some whitespace
                .range([min, this.canvas.plotArea.height]);
        }
    }
}
