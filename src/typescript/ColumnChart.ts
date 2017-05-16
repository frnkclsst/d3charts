"use strict";

import { AxisType, ScaleType } from "./Enums";
import { IDatum, IChartData, IOptions} from "./IInterfaces";
import { ColumnShape } from "./Shape.Column";
import { XYChart } from "./XYChart";

export class ColumnChart extends XYChart {

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
            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw columns
            for (var serie = 0; serie < this.series.length; serie++) {
                var column = new ColumnShape(svgSeries, this, serie);

                column
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

    public getHeight(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return Math.abs(axis.scale(d.y1) - this.axes[index].scale(d.y0));
    }

    public getWidth(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale.rangeBand() / this.series.length;
        }
        else {
            return this.canvas.plotArea.width / this.series.length / this.categories.length;
        }
    }

    public getXCoordinate(d: IDatum, i: number, serie: number): number {
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

    public getYCoordinate(d: IDatum, i: number, serie: number): number {
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
