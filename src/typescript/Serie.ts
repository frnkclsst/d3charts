"use strict";

import * as d3 from "d3";
import { Chart } from "./Chart";
import { ISerie } from "./IInterfaces";
import { SymbolType } from "./Enums";

export class Serie {
    public axis: string;
    public data: number[];
    public format: string;
    public index: number;
    public marker: string;
    public name: string;
    public max: number[];
    public min: number[];
    public size: number[];
    public suffix: string;
    public sum: number;
    public type: string;
    public visible: boolean;

    private _chart: Chart;

    constructor(chart: Chart, serie: ISerie, index: number) {
        this._chart = chart;
        this.data = serie.data != undefined ? serie.data : [];
        this.max = serie.max != undefined ? serie.max : [];
        this.min = serie.min != undefined ? serie.min : [];

        // TODO - separate the options from the real data
        this.axis = serie.axis;
        this.visible = true;
        this.format = serie.format;
        this.index = index;
        this.marker = this._setMarkerType(serie);
        this.name = serie.name;
        this.size = serie.size;
        this.suffix = serie.suffix;
        this.sum = d3.sum(this.data);
        this.type = serie.type;
    }

    public getName(i: number): string {
        if (this.name != undefined && this.name != "") {
            return this.name;
        }

        if (this.axis != null)   {
            return this.axis;
        }

        return "Serie " + (i + 1);
    }

    private _setMarkerType(serie: ISerie): string {
        if (serie.marker != undefined) {
            return serie.marker;
        }
        else if (this._chart.options.plotOptions.markers.type === "mixed") {
            return SymbolType[this.index % SymbolType.length];
        }
        else if (this._chart.options.plotOptions.markers.type != undefined) {
            return this._chart.options.plotOptions.markers.type;
        }
        else {
            return "circle";
        }
    }
}
