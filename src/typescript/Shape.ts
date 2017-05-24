"use strict";

import * as d3 from "d3";
import { IDatum } from "./IInterfaces";
import { Chart } from "./Chart";

export class Shape {

    protected _animation: {
        duration: number,
        ease: string
    };
    protected _chart: Chart;
    protected _color: string;
    protected _labels: {
        format: string;
        rotate: boolean;
        visible: boolean;
    };
    protected _opacity: number;
    protected _serie: number;
    protected _svg: d3.Selection<SVGElement>;
    protected _svgLabels: d3.Selection<SVGElement>;
    protected _x: (d: IDatum, i: number, serie: number) => number;
    protected _y: (d: IDatum, i: number, serie: number) => number;

    constructor(svg: d3.Selection<SVGElement>, chart: Chart, serie: number) {
        this._chart = chart;
        this._serie = serie;
        this._svg = svg;

        this.animation(0, "linear");
        this.color("#000");
        this.opacity(1);
        this.labels("", false, false);

        // Register event callback
        this._chart.dispatcher.on("onlegendclick.shape", (i: number): void => {
            this.toggleShapeVisibility(i);
        });
    }

    public draw(data: IDatum[]): void {

    }

    public animation(duration: number, ease: string): Shape {
        this._animation = {
            duration: duration,
            ease: ease
        };
        return this;
    }

    public color(color: string): Shape {
        this._color = color;
        return this;
    }

    public labels(format: string, rotate: boolean, visible: boolean): Shape {
        this._labels = {
            format: format,
            rotate: rotate,
            visible: visible
        };
        return this;
    }

    public opacity(opacity: number): Shape {
        this._opacity = opacity;
        return this;
    }

    public x(x: (d: IDatum, i: number, s: number) => number): Shape {
        this._x = x;
        return this;
    }

    public y(y: (d: IDatum, i: number, s: number) => number): Shape {
        this._y = y;
        return this;
    }

    // TODO - refactor
    public toggleShapeVisibility(index: number): void {
        var serie = d3.selectAll(this._chart.selector + " #serie-" + index),
            opacity = serie.style("opacity") === "1" ? 0 : 1;

        d3.select(this._chart.selector + " #serie-" + index).transition().duration(200).style("opacity", opacity);
        d3.select(this._chart.selector + " #labels-" + index).transition().duration(200).style("opacity", opacity);
        d3.select(this._chart.selector + " #area-" + index).transition().duration(200).style("opacity", opacity);
    }

    protected drawLabels(): void {
        this._svgLabels = this._svg.append("g")
            .attr("id", "labels-" + this._serie)
            .attr("opacity", "1");
    }
}
