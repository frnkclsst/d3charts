/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Series {
        public items: Serie[];
        public labels: string[];
        public length: number;

        private _matrix: any[];
        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.items = this._setSeries(chart.data.series.items);
            this.labels = this._setLabels();
            this.length = this.items.length;

            this._matrix = this._setStackedMatrix();
        }

        public getSerie(i: number): Serie {
            return this.items[i];
        }

        public getMatrixByAxisName(name: string): Serie[] {
            var array = [];
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].axis === name) {
                    array.push(this.getMatrixItem(i));
                }
            }
            return array;
        }

        public getMatrixItem(i: number): any {
            return this._matrix[i];
        }

        public getLabel(i: number): string {
            return this.items[i].getName(i);
        }

        public getLabels(): string[] {
            var array: string[] = [];
            for (var i = 0; i < this.items.length; i++) {
                array.push(this.items[i].getName(i));
            }
            return array;
        }

        public getMaxValue(name?: string): number {
            var matrix = [];
            if (name != undefined && name != "" && this._chart.stackType === StackType.None) {
                matrix = this.getMatrixByAxisName(name);
            }
            if (matrix.length === 0) {
                matrix = this._matrix;
            }

            if (this._chart.stackType != StackType.None && this.items.length > 1) { // can only be stacked if you have more than 1 series defined
                return d3.max(matrix, function (array: number[]): number {
                    return d3.max(array, function (d: any): number {
                        return d.y0;
                    });
                });
            }
            else {
                return d3.max(matrix, function (array: number[]): number {
                    return d3.max(array, function (d: any): number {
                        return d.y;
                    });
                });
            }
        }

        public getMinValue(name?: string): number {
            var matrix = [];
            if (name != undefined && name != "" && this._chart.stackType === StackType.None) {
                matrix = this.getMatrixByAxisName(name);
            }
            if (matrix.length === 0) {
                matrix = this._matrix;
            }

            if (this._chart.stackType != StackType.None && this.items.length > 1) { // can only be stacked if you have more than 1 series defined
                return d3.min(matrix, function (array: number[]): number {
                    return d3.min(array, function (d: any): number {
                        return d.y0 + d.y;
                    });
                });
            }
            else {
                return d3.min(matrix, function (array: number[]): number {
                    return d3.min(array, function (d: any): number {
                        return d.y;
                    });
                });
            }
        }

        private _getMappedMatrix(): any[] {
            var matrix = [];
            for (var serie = 0; serie < this.items.length; serie++) {
                matrix.push(this.items[serie].getValues());
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
            for (var i = 0; i < this.items.length; i++) {
                names.push(this.items[i].getName(i));
            }
            return names;
        }

        private _setSeries(series: any): Serie[] {
            var array: Serie[] = [];
            for (var i = 0; i < series.length; i++) {
                array.push(new Serie(this._chart, series[i], i));
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