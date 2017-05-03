"use strict";

import { AxisType, ScaleType } from "./Enums";
import { Axis } from "./Axis";
import { XYChart } from "./XYChart";
import { SVGBar } from "./Shape.Bar";

export class BarChart extends XYChart {

    public draw(): void {
        super.draw();

        // draw chart
        var svgSeries = this.canvas.plotArea.svg.append("g")
            .attr("class", "series");

        // draw bars
        for (var serie = 0; serie < this.series.length; serie++) {
            var bar = new SVGBar(svgSeries, this, serie);
            bar.animation = {
                duration: this.options.plotOptions.animation.duration,
                ease: this.options.plotOptions.animation.ease
            };
            bar.color = this.colorPalette.color(serie);
            bar.labels = {
                format: this.series.items[serie].format,
                rotate: this.options.series.labels.rotate,
                visible: this.options.series.labels.visible
            };
            bar.height = (d: any, i: number, s: number) => {
                return this.getHeight(d, i, s);
            };
            bar.width = (d: any, i: number, s: number) => {
                return this.getWidth(d, i, s);
            };
            bar.x = (d: any, i: number, s: number) => {
                return this.getXCoordinate(d, i, s);
            };
            bar.y = (d: any, i: number, s: number) => {
                return this.getYCoordinate(d, i, s);
            };
            bar.draw(this.series.getMatrixItem(serie));
        }
    }

    public getXCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (d.y < 0) {
            return Math.abs(axis.scale(d.y0));
        }
        else {
            return axis.scale(d.y0);
        }
    }

    public getYCoordinate(d: any, i: number, serie: number): any {
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

    public getHeight(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return Math.abs(axis.scale.rangeBand() / this.series.length);
        }
        else {
            return Math.abs(this.canvas.plotArea.height / this.series.length / this.categories.length);
        }
    }

    public getWidth(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(d.y1) - axis.scale(d.y0));
    }

    public getXScale(axis: Axis): any {
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
                .domain(this.categories.getLabels())
                .rangeRoundBands([start, end], this.options.plotOptions.bands.innerPadding, this.options.plotOptions.bands.outerPadding);
        }
        else {
            axis.setScaleType(ScaleType.Time);
            return d3.time.scale()
                .domain(d3.extent(this.categories.getLabels(), (d: any): Date => {
                    return d3.time.format(this.categories.format).parse(d);
                }).reverse())
                .nice() // adds additional ticks to add some whitespace
                .range([min, this.canvas.plotArea.height]);
        }
    }
}
