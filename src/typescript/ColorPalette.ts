"use strict";

import { Chart } from "./Chart";

export class ColorPalette {
    public color: any;

    private _chart: Chart;

    constructor(chart: Chart) {
        this._chart = chart;
        this.color = d3.scale.ordinal()
            .range(this._chart.options.plotOptions.colors);
    }
}