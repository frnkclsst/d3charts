/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Series {
        public labels: string[];
        public length: number;

        private _matrix: any[];
        private _chart: Chart;
        private _items: Serie[];

        constructor(chart: Chart) {
            this._chart = chart;
            this._items = this._setSeries(chart.settings.getValue("series"));
            this._matrix = this._setStackedMatrix();

            this.labels = this._setLabels();
            this.length = this._items.length;
        }

        public getColor(i: number): string {
            return this._items[i].getColor(i);
        }

        public getSerie(i: number): Serie {
            return this._items[i];
        }

        public getMatrixItem(i: number): any {
            return this._matrix[i];
        }

        public getMatrix(): any {
            return this._matrix;
        }

        public getLabel(i: number): string {
            return this._items[i].getName(i);
        }

        public getMaxValue(): number {
            if (this._chart.stackType != StackType.None && this._items.length > 1) { // can only be stacked if you have more than 1 series defined
                return d3.max(this._matrix, function (array: number[]): number {
                    return d3.max(array, function (d: any): number {
                        return d.y0;
                    });
                });
            }
            else {
                return d3.max(this._matrix, function (array: number[]): number {
                    return d3.max(array, function (d: any): number {
                        return d.y;
                    });
                });
            }
        }

        public getMinValue(): number {
            if (this._chart.stackType != StackType.None && this._items.length > 1) { // can only be stacked if you have more than 1 series defined
                return d3.min(this._matrix, function (array: number[]): number {
                    return d3.min(array, function (d: any): number {
                        return d.y0 + d.y;
                    });
                });
            }
            else {
                return d3.min(this._matrix, function (array: number[]): number {
                    return d3.min(array, function (d: any): number {
                        return d.y;
                    });
                });
            }
        }

        private _getMappedMatrix(): any[] {
            var matrix = [];
            for (var serie = 0; serie < this._items.length; serie++) {
                matrix.push(this._items[serie].getValues());
            }

            var mappedMatrix = matrix.map(function (data: any, i: number): any[] {
                var t = matrix[i];
                return t.map(function (d: any, j: number): any {
                    return { y: d, y0: 0, perc: 0 };
                });
            });

            return mappedMatrix;
        }

        private _setStackedMatrix(): any[] {
            var matrix = this._getMappedMatrix();

            var transposedMatrix = this._transposeMatrix(matrix);

            transposedMatrix.forEach(function (m: any): any {
                var posBase = 0, negBase = 0, sum = 0;

                m.forEach(function (k: any): any {
                    sum = sum + Math.abs(k.y);
                });

                m.forEach(function (k: any): any {
                    k.perc = k.y / sum; // calculate percentage of this value across the different series
                    k.max = sum;
                    if (k.y < 0) {
                        k.y0 = negBase;
                        negBase -= Math.abs(k.y);
                    }
                    else {
                        k.y0 = posBase = posBase + Math.abs(k.y);
                    }
                });
            });

            return this._transposeMatrix(transposedMatrix);
        }

        private _setLabels(): string[] {
            var names: string[] = [];
            for (var i = 0; i < this._items.length; i++) {
                names.push(this._items[i].getName(i));
            }
            return names;
        }

        private _setSeries(series: any): Serie[] {
            var array: Serie[] = [];
            for (var i = 0; i < series.length; i++) {
                array.push(new Serie(series[i]));
            }
            return array;
        }

        private _transposeMatrix(a: any): any {
            return Object.keys(a[0]).map(
                function (c: any): any {
                    return a.map(function (r: any): any { return r[c]; });
                });
        }
    }
}