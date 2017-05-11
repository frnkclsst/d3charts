"use strict";

import { Chart } from "./Chart";

export class ChartArea {
    public border: {
        bottom: boolean;
        left: boolean;
        right: boolean;
        top: boolean;
    };
    public height: number;
    public padding: number;
    public width: number;
    public svg: D3.Selection;
    public x: number;
    public y: number;

    protected _chart: Chart;

    constructor(chart: Chart) {
        this._chart = chart;

        this.height = 0;
        this.padding = 0;
        this.width = 0;
        this.x = 0;
        this.y = 0;
    }

    public drawBorder(x1: number, x2: number, y1: number, y2: number): void {
        this.svg.append("line")
            .attr("class", "sep")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2);
    }

    public drawBorders(): void {
        if (this.border.bottom) {
            this.drawBorder(0, this.width, this.height, this.height);
        }
        if (this.border.top) {
            this.drawBorder(0, this.width, 0, 0);
        }
        if (this.border.left) {
            this.drawBorder(0, 0, 0, this.height);
        }
        if (this.border.right) {
            this.drawBorder(this.width, this.width, 0, this.height);
        }
    }

}