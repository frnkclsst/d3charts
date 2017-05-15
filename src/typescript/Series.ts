"use strict";

import * as d3 from "d3";
import { Chart } from "./Chart";
import { IDatum, ISerie } from "./IInterfaces";
import { Serie } from "./Serie";
import { StackType } from "./Enums";

export class Series {
    public items: Serie[];
    public labels: string[];
    public length: number;

    private _matrix: IDatum[][];
    private _chart: Chart;

    constructor(chart: Chart) {
        this._chart = chart;

        this.items = this._getSeries(chart.data.series);
        this.labels = this._getLabels();
        this.length = this.items.length;

        this._matrix = this._getStackedMatrix();
    }

    public getMatricesByAxisName(name: string): IDatum[][] {
        var array: IDatum[][] = [],
            i = this.items.length;

        while (i--) {
            if (this.items[i].axis === name) {
                array.push(this.getMatrixItem(i));
            }
        }

        return array;
    }

    public getMatrixItem(i: number): IDatum[] {
        return this._matrix[i];
    }

    public getLabel(i: number): string {
        return this.items[i].getName(i);
    }

    public getLabels(): string[] {
        var array: string[] = [],
            i = this.items.length;

        while (i--) {
            array.push(this.items[i].getName(i));
        }
        return array;
    }

    public max(name?: string): number {
        var matrix: IDatum[][] = [];

        if (name != undefined && name != "" && this._chart.stackType === StackType.None) {
            matrix = this.getMatricesByAxisName(name);
        }

        if (matrix.length === 0) {
            matrix = this._matrix;
        }

        if (this._chart.stackType != StackType.None && this.items.length > 1) { // can only be stacked if you have more than 1 series defined
            return d3.max(matrix, function (array: IDatum[]): number {
                return d3.max(array, function (d: IDatum): number {
                    return d.sum;
                });
            });
        }
        else {
            return d3.max(matrix, function (array: IDatum[]): number {
                return d3.max(array, function (d: IDatum): number {
                    if (d.y != undefined && d.y > d.y1) {
                        return d.y;
                    }
                    return d.y1;
                });
            });
        }
    }

    public min(name?: string): number {
        var matrix: IDatum[][] = [];

        if (name != undefined && name != "" && this._chart.stackType === StackType.None) {
            matrix = this.getMatricesByAxisName(name);
        }

        if (matrix.length === 0) {
            matrix = this._matrix;
        }

        if (this._chart.stackType != StackType.None && this.items.length > 1) { // can only be stacked if you have more than 1 series defined
            return d3.min(matrix, function (array: IDatum[]): number {
                return d3.min(array, function (d: IDatum): number {
                    return d.sum + d.y;
                });
            });
        }
        else {
            return d3.min(matrix, function (array: IDatum[]): number {
                return d3.min(array, function (d: IDatum): number {
                    if (d.y != undefined && d.y < d.y0) {
                        return d.y;
                    }
                    return d.y0;
                });
            });
        }
    }

    private _initializeArray(): number[][] {
        let array: number[] = [],
            matrix: number[][] = [],
            i = 0,
            items = this.items.length;

        for (i = 0; i < items; i++) {
            array = this.items[i].data;
            if (array.length === 0) {
                var length = this.items[i].min.length != 0 ? this.items[i].min.length : this.items[i].max.length;
                array = Array.apply(null, new Array(length)).map((): number => { return undefined; });
            }
            matrix.push(array);
        }

        return matrix;
    }

    private _getLabels(): string[] {
        let array: string[] = [],
            i = 0,
            length = this.items.length;

        for (i = 0; i < length; i++) {
            array.push(this.items[i].getName(i));
        }

        return array;
    }

    private _getStackedMatrix(): IDatum[][] {
        var matrix = this._mapMatrix(),
            transposedMatrix = this._transposeMatrix(matrix);

        if (transposedMatrix.length > 0) {
            transposedMatrix.forEach(function (m: IDatum[]): void {
                var posBase = 0, negBase = 0, sum = 0;

                m.forEach(function (k: IDatum): void {
                    sum = sum + Math.abs(k.y);
                });

                m.forEach(function (k: IDatum): void {
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
            matrix = this._transposeMatrix(transposedMatrix);
        }

        return matrix;
    }

    private _getSeries(series: ISerie[]): Serie[] {
        var array: Serie[] = [],
            i = 0,
            length = series.length;

        for (i = 0; i < length; i++) {
            array.push(new Serie(this._chart, series[i], i));
        }

        return array;
    }

    private _mapMatrix(): IDatum[][] {
        let matrix: number[][] = [],
            mappedMatrix: IDatum[][];

        matrix = this._initializeArray();

        mappedMatrix = matrix.map((data: number[], i: number): IDatum[] => {
            var t = matrix[i];
            return t.map((d: number, j: number): IDatum => {
                return {
                    max: 0,     // max of data points across the different series
                    perc: 0,    // perc of the data point across the series
                    sum: 0,     // sum of this data point and previous one, used for stacked charts
                    y: d,       // base data point
                    y0: this.items[i].min[j] != undefined ? this.items[i].min[j] : 0, // min data point
                    y1: this.items[i].max[j] != undefined ? this.items[i].max[j] : d // max data point
                };
            });
        });

        return mappedMatrix;
    }

    private _transposeMatrix(a: any): any {
        return Object.keys(a[0]).map(
            function (c: any): any {
                return a.map(function (r: any): any { return r[c]; });
            });
    }
}
