"use strict";

import { AxisType, ScaleType } from "./Enums";
import { XYChart } from "./XYChart";
import { SVGColumn } from "./Shape.Column";

export class ColumnChart extends XYChart {

    public draw(): void {
        super.draw();

        // draw chart
        var svgSeries = this.canvas.plotArea.svg.append("g")
            .attr("class", "series");

        // draw columns
        for (var serie = 0; serie < this.series.length; serie++) {
            var column = new SVGColumn(svgSeries, this, serie);
            column.animation = {
                duration: this.options.plotOptions.animation.duration,
                ease: this.options.plotOptions.animation.ease
            };
            column.color = this.colorPalette.color(serie);
            column.labels = {
                format: this.series.items[serie].format,
                rotate: this.options.series.labels.rotate,
                visible: this.options.series.labels.visible
            };
            column.height = (d: any, i: number, s: number) => {
                return this.getHeight(d, i, s);
            };
            column.width = (d: any, i: number, s: number) => {
                return this.getWidth(d, i, s);
            };
            column.x = (d: any, i: number, s: number) => {
                return this.getXCoordinate(d, i, s);
            };
            column.y = (d: any, i: number, s: number) => {
                return this.getYCoordinate(d, i, s);
            };
            column.draw(this.series.getMatrixItem(serie));
        }
    }

    public getHeight(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(d.y1) - this.axes[index].scale(d.y0));
    }

    public getWidth(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale.rangeBand() / this.series.length;
        }
        else {
            return this.canvas.plotArea.width / this.series.length / this.categories.length;
        }
    }

    public getXCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];
        var axisScale = this.categories.parseFormat(this.categories.getItem(i));

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale(axisScale) + (axis.scale.rangeBand() / this.series.length * serie);
        }
        else {
            return axis.scale(axisScale) + (this.canvas.plotArea.width / this.series.length / this.categories.length * serie);
        }
    }

    public getYCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (d.y < 0) {
            return Math.abs(axis.scale(0));
        }
        else {
            return axis.scale(d.y1);
        }
    }
}