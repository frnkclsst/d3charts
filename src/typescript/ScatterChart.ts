"use strict";

import * as d3 from "d3";
import { AxisType, ScaleType } from "./Enums";
import { IDatum, IChartData, IOptions } from "./IInterfaces";
import { Axis } from "./Axis";
import { XYChart } from "./XYChart";
import { SVGBubble } from "./Shape.Bubble";

export class ScatterChart extends XYChart {

    private svgSeries: d3.Selection<SVGElement>;

    constructor(selector: string, data: IChartData, options?: IOptions) {
        super(selector, data, options);

        // Overrides
        this.canvas.legendArea.items = this.series.getLabels().slice(1, this.series.getLabels().length);
        for (var i: number = 0; i < this.axes.length; i++) {
            this.axes[i].isDataAxis = (this.axes[i].type === AxisType.Y);
        }
    }

    public draw(): void {
        super.draw();

        if (this.hasData()) {
            this.svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            for (var serie = 1; serie < this.series.length; serie++) {
                var bubbles = new SVGBubble(this.svgSeries, this, serie);
                bubbles.animation = {
                    duration: this.options.plotOptions.animation.duration,
                    ease: this.options.plotOptions.animation.ease
                };
                bubbles.color = this.colorPalette.color(serie - 1);
                bubbles.labels = {
                    format: this.series.items[serie].format,
                    rotate: this.options.series.labels.rotate,
                    visible: this.options.series.labels.visible
                };
                bubbles.marker.type = this.series.items[serie - 1].marker;
                bubbles.x = (d: IDatum, i: number, s: number) => {
                    return this.getXCoordinate(d, i, s);
                };
                bubbles.y = (d: IDatum, i: number, s: number) => {
                    return this.getYCoordinate(d, i, s);
                };
                bubbles.draw(this.series.getMatrixItem(0));
            }
        }
    }

    public getXCoordinate(d: IDatum, i: number, serie: number): number {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.y);
    }

    public getYCoordinate(d: IDatum, i: number, serie: number): number {
        var data = this.series.getMatrixItem(serie);
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(data[i].y);
    }

    public getXScale(axis: Axis): d3.scale.Linear<number, number> {
        var min = d3.min(this.series.items[0].data);
        var max = d3.max(this.series.items[0].data);
        var start = this.canvas.plotArea.axisSize.left;
        var end =  this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

        axis.setScaleType(ScaleType.Linear);
        return d3.scale.linear()
            .domain([min < 0 ? min : 0, max])
            .nice() // adds additional ticks to add some whitespace
            .range([start, end]);
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
