/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Serie {
        public enabled: boolean;
        public format: string;
        public name: string;
        public max: number;
        public min: number;
        public suffix: string;
        public sum: number;
        public type: string;

        private _data: number[];

        constructor(serie: any) {
            this._data = serie.data;

            this.enabled = true;
            this.format = serie.format;
            this.name = serie.name;
            this.max = d3.max(this._data);
            this.min = d3.min(this._data);
            this.suffix = serie.suffix;
            this.sum = d3.sum(this._data);
            this.type = serie.type;
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