/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Serie {
        public axis: string;
        public format: string;
        public index: number;
        public marker: string;
        public max: number;
        public min: number;
        public name: string;
        public size: number;
        public suffix: string;
        public sum: number;
        public type: string;
        public visible: boolean;

        private _chart: Chart;
        private _data: number[];

        constructor(chart: Chart, serie: any, index: number) {
            this._chart = chart;
            this._data = serie.data;

            this.axis = serie.axis;
            this.visible = true;
            this.format = serie.format;
            this.index = index;
            this.marker = this._setMarkerType(serie);
            this.max = d3.max(this._data);
            this.min = d3.min(this._data);
            this.name = serie.name;
            this.size = serie.size;
            this.suffix = serie.suffix;
            this.sum = d3.sum(this._data);
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

        public getValues(): number[] {
            return this._data;
        }

        private _setMarkerType(serie: any): string {
            if (serie.marker != undefined) {
                return serie.marker;
            }
            else if (this._chart.options.linechart.markers.type === "mixed") {
                return symbols[this.index % symbols.length];
            }
            else if (this._chart.options.linechart.markers.type != undefined) {
                return this._chart.options.linechart.markers.type;
            }
            else {
                return "circle";
            }
        }
    }
}