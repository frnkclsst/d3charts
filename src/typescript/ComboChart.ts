"use strict";

import { AxisType, ScaleType } from "./Enums";
import { XYChart } from "./XYChart";
import { IDatum, IChartData, IOptions } from "./IInterfaces";
import { ColumnShape } from "./Shape.Column";
import { LineShape } from "./Shape.Line";

export class ComboChart extends XYChart {

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);

        // Overrides
        for (var i: number = 0; i < this.axes.length; i++) {
            this.axes[i].isDataAxis = (this.axes[i].type === AxisType.Y);
        }
    }

    public draw(): void {
        super.draw();

        if (this.hasData()) {
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // TODO - Combo chart has no fallback shape if shape type is not defined on serie
            // draw lines
            for (var columnSerie = 0; columnSerie < this.series.length; columnSerie++) {
                if (this.series.items[columnSerie].type === "column") {
                    var column = new ColumnShape(svgSeries, this, columnSerie);

                    column
                        .animation(
                            this.options.plotOptions.animation.duration,
                            this.options.plotOptions.animation.ease
                        )
                        .color(this.colorPalette.color(columnSerie))
                        .height((d: IDatum, i: number, s: number) => {
                            return this.getHeightColumn(d, i, s);
                        })
                        .labels(
                            this.series.items[columnSerie].format,
                            this.options.series.labels.rotate,
                            this.options.series.labels.visible
                        )
                        .width((d: IDatum, i: number, s: number) => {
                            return this.getWidthColumn(d, i, s);
                        })
                        .x((d: IDatum, i: number, s: number) => {
                            return this.getXCoordinateColumn(d, i, s);
                        })
                        .y((d: IDatum, i: number, s: number) => {
                            return this.getYCoordinateColumn(d, i, s);
                        })
                        .draw(this.series.getMatrixItem(columnSerie));
                }
            }

            for (var lineSerie = 0; lineSerie < this.series.length; lineSerie++) {
                if (this.series.items[lineSerie].type === "line") {
                    if (this.series.items[lineSerie].data.length != 0) {
                        var line = new LineShape(svgSeries, this, lineSerie);

                        line
                            .animation(
                                this.options.plotOptions.animation.duration,
                                this.options.plotOptions.animation.ease
                            )
                            .color(this.colorPalette.color(lineSerie))
                            .labels(
                                this.series.items[lineSerie].format,
                                this.options.series.labels.rotate,
                                this.options.series.labels.visible
                            )
                            .x((d: IDatum, i: number, s: number): number => {
                                return this.getXCoordinateLine(d, i, s);
                            })
                            .y((d: IDatum, i: number, s: number): number => {
                                return this.getYCoordinateLine(d, i, s);
                            })
                            .draw(this.series.getMatrixItem(lineSerie));
                    }
                }
            }
        }
    }

    public getHeightColumn(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(d.y) - this.axes[index].scale(0));
    }

    public getWidthColumn(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale.rangeBand() / this._getColumnTotal();
        }
        else {
            return this.canvas.plotArea.width / this._getColumnTotal() / this.categories.length;
        }
    }

    public getXCoordinateColumn(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];
        var axisScale = this.categories.parseFormat(this.categories.getItem(i));

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale(axisScale) + (axis.scale.rangeBand() / this._getColumnTotal() * this._getCurrentColumn(serie));
        }
        else {
            return axis.scale(axisScale) + (this.canvas.plotArea.width / this.categories.length / this._getColumnTotal() * this._getCurrentColumn(serie));
        }
    }

    public getYCoordinateColumn(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (d.y < 0) {
            return axis.scale(d.y) - Math.abs(axis.scale(d.y) - this.axes[index].scale(0));
        }
        else {
            return axis.scale(d.y);
        }
    }

    public getXCoordinateLine(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
        }
        else {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i)));
        }
    }

    public getYCoordinateLine(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.y);
    }

    public getY0CoordinateLine(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);

        return this.axes[index].scale(0);
    }

    private _getCurrentColumn(serie: number): number {
        var count = -1;
        for (var i = 0; i < this.series.length; i++) {
            if (this.series.items[i].type === "column") {
                count += 1;
            }
            if (i === serie) {
                return count;
            }
        }
        return -1;
    }

    private _getColumnTotal(): number {
        var count = 0;
        for (var i = 0; i < this.series.length; i++) {
            if (this.series.items[i].type === "column") {
                count += 1;
            }
        }
        return count;
    }
}
