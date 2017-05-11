"use strict";

import { Chart } from "./Chart";

export class Categories {
    public format: string;
    public title: string;
    public length: number;

    private _items: string[];

    constructor(chart: Chart) {
        this.format = chart.data.categories.format;
        this._items = this._setCategories(chart.data.categories.data);
        this.length = this._items.length;
    }

    public getItem(i: number): string {
        return this._items[i];
    }

    public getLabels(): string[] {
        return this._items;
    }

    public getLabel(i: number): string {
        return this._items[i];
    }

    public parseFormat(value: string): any {
        if (this.format === "%s") {
            return value;
        }
        else if (this.format === "%n") {
            return value;
        }
        else {
            return d3.time.format(this.format).parse(value);
        }
    }

    private _setCategories(categories: string[]): string[] {
        var array: string[] = [];
        for (var i = 0; i < categories.length; i++) {
            array.push(categories[i]);
        }
        return array;
    }
}