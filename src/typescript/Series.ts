"use strict";

import { StackType } from "./Enums";
import { Serie } from "./Serie";
import { Chart } from "./Chart";

export class Series {
    public items: Serie[];
    public labels: string[];
    public length: number;

    private _matrix: any[];
    private _chart: Chart;

    constructor(chart: Chart) {
        this._chart = chart;

        this.items = this._setSeries(chart.data.series);
        this.labels = this._setLabels();
        this.length = this.items.length;

        this._matrix = this._setStackedMatrix();
    }

    public getMatrixByAxisName(name: string): Serie[] {
        var array: any[] = [];
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

    public max(name?: string): number {
        var matrix: any[] = [];
        if (name != undefined && name != "" && this._chart.stackType === StackType.None) {
            matrix = this.getMatrixByAxisName(name);
        }
        if (matrix.length === 0) {
            matrix = this._matrix;
        }

        if (this._chart.stackType != StackType.None && this.items.length > 1) { // can only be stacked if you have more than 1 series defined
            return d3.max(matrix, function (array: number[]): number {
                return d3.max(array, function (d: any): number {
                    return d.sum;
                });
            });
        }
        else {
            return d3.max(matrix, function (array: number[]): number {
                return d3.max(array, function (d: any): number {
                    if (d.y != undefined && d.y > d.y1) {
                        return d.y;
                    }
                    return d.y1;
                });
            });
        }
    }

    public min(name?: string): number {
        var matrix: any[] = [];
        if (name != undefined && name != "" && this._chart.stackType === StackType.None) {
            matrix = this.getMatrixByAxisName(name);
        }
        if (matrix.length === 0) {
            matrix = this._matrix;
        }

        if (this._chart.stackType != StackType.None && this.items.length > 1) { // can only be stacked if you have more than 1 series defined
            return d3.min(matrix, function (array: number[]): number {
                return d3.min(array, function (d: any): number {
                    return d.sum + d.y;
                });
            });
        }
        else {
            return d3.min(matrix, function (array: number[]): number {
                return d3.min(array, function (d: any): number {
                    if (d.y != undefined && d.y < d.y0) {
                        return d.y;
                    }
                    return d.y0;
                });
            });
        }
    }

    private _getMappedMatrix(): any[] {
        var matrix: any[] = [];
        for (var serie = 0; serie < this.items.length; serie++) {
            if (this.items[serie].data.length != 0) {
                matrix.push(this.items[serie].data);
            }
            else {
                var array: any[] = [];
                var length = 0;

                length = this.items[serie].min.length != 0 ? this.items[serie].min.length : this.items[serie].max.length;
                array = Array.apply(null, new Array(length)).map((): any => { return undefined; });
                matrix.push(array);
            }
        }

        var mappedMatrix = matrix.map((data: any, i: number): any[] => {
            var t = matrix[i];
            return t.map((d: any, j: number): any => {
                return {
                    max: 0, // max of data points across the different series
                    perc: 0, // perc of the data point across the series
                    sum: 0, // sum of this data point and previous one, used for stacked charts
                    y: d, // base data point
                    y0: this.items[i].min[j] != undefined ? this.items[i].min[j] : 0, // min data point
                    y1: this.items[i].max[j] != undefined ? this.items[i].max[j] : d // max data point
                };
            });
        });

        return mappedMatrix;
    }

    private _setStackedMatrix(): any[] {
        var matrix = this._getMappedMatrix();

        var transposedMatrix = this._transposeMatrix(matrix);

        if (transposedMatrix.length > 0) {
            transposedMatrix.forEach(function (m: any): any {
                var posBase = 0, negBase = 0, sum = 0;

                m.forEach(function (k: any): any {
                    sum = sum + Math.abs(k.y);
                });

                m.forEach(function (k: any): any {
                    k.perc = k.y / sum; // calculate percentage of this value across the different series
                    k.max = sum;
                    if (k.y < 0) {
                        k.sum = negBase;
                        negBase -= Math.abs(k.y);
                    }
                    else {
                        k.sum = posBase = posBase + Math.abs(k.y);
                    }
                });
            });
            return this._transposeMatrix(transposedMatrix);
        }
        else {
            return matrix;
        }

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