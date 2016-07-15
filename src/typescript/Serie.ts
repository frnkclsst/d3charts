/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Serie {
        public max: number;
        public min: number;
        public sum: number;

        private _color: string;
        private _fillColor: string;
        private _data: number[];
        private _name: string;

        constructor(serie: any) {
            this._color = serie.color;
            this._fillColor = serie.fillColor;
            this._data = serie.data;
            this._name = serie.name;

            this.max = d3.max(this._data);
            this.min = d3.min(this._data);
            this.sum = d3.sum(this._data);
        }

        public getColor(i?: number): string {
            //TODO - fallback in case bigger than 20 series
            if (this._color != null) {
                return this._color;
            }
            return ColorPalette.getColor(i);
        }

        public getFillColor(i?: number): string {
            //TODO - fallback in case bigger than 20 series
            if (this._fillColor != null) {
                return this._fillColor;
            }
            return ColorPalette.getFillColor(i);
        }

        public getName(i: number): string {
            if (this._name != null) {
                return this._name;
            }
            return "Serie " + (i + 1);
        }

        public getValues(): number[] {
            return this._data;
        }
    }
}