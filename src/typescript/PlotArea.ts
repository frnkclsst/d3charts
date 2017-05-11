"use strict";

import { ChartArea } from "./ChartArea";
import { Chart } from "./Chart";

export class PlotArea extends ChartArea {
    public axisSize: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    public padding: number;

    constructor(chart: Chart) {
        super(chart);

        this.axisSize = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        this.border = {
            bottom: chart.options.plotArea.border.bottom,
            left: chart.options.plotArea.border.left,
            right: chart.options.plotArea.border.right,
            top: chart.options.plotArea.border.top
        };
        this.padding = chart.options.plotArea.padding;
    }

    public draw(): void {
        this.axisSize = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        this.svg = this._chart.canvas.svg.append("g")
            .attr("class", "plotarea")
            .attr("transform", "translate(" + (this.x + this.padding) + "," + (this.y + this.padding) + ")");

        this.drawBorders();
    }
}