/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Serie {
        public max: number;
        public min: number;
        public name: string;
        public sum: number;
        public tooltipPointFormat: string;
        public tooltipSuffix: string;
        public type: string;

        private _data: number[];

        constructor(serie: any) {
            this._data = serie.data;
            this.name = serie.name;
            this.tooltipSuffix = serie.tooltipSuffix;
            this.tooltipPointFormat = serie.tooltipPointFormat;
            this.type = serie.type;

            this.max = d3.max(this._data);
            this.min = d3.min(this._data);
            this.sum = d3.sum(this._data);
        }

        public getName(i: number): string {
            if (this.name != null) {
                return this.name;
            }
            return "Serie " + (i + 1);
        }

        public getValues(): number[] {
            return this._data;
        }
    }
}