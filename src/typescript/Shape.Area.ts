"use strict";

import * as d3 from "d3";
import { IDatum } from "./IInterfaces";
import { Shape } from "./Shape";
import { XYChart } from "./XYChart";
import { LineChart } from "./LineChart";

export class AreaShape extends Shape {
    protected _chart: XYChart;
    protected _interpolation: string;
    protected _y0: (d: IDatum, i: number, serie: number) => number;
    protected _y1: (d: IDatum, i: number, serie: number) => number;

    constructor(svg: d3.Selection<SVGElement>, chart: LineChart, serie: number) {
        super(svg, chart, serie);
        this._chart = chart;

        this.interpolation(this._interpolation);
    }

    public draw(data: any[]): void {
        var d3Area = d3.svg.area()
            .interpolate(this._interpolation)
            .x((d: any, i: number): number => { return this._x(d, i, this._serie); } )
            .y0((d: any, i: number): number => { return this._y0(d, i, this._serie); })
            .y1((d: any, i: number): number => { return this._y1(d, i, this._serie); });

        var svgArea = this._svg.append("g")
            .attr("id", "area-" + this._serie);

        var svgPath: d3.Selection<SVGElement> = svgArea.append("path")
            .attr("class", "area")
            .attr("d", d3Area(data))
            .style("fill", this._color)
            .style("opacity", 0);

        // add animation
        svgPath
            .transition()
            .duration(this._animation.duration)
            .ease(this._animation.ease)
            .style("opacity", this._opacity);
    }

    public animation(duration: number, ease: string): AreaShape {
        super.animation(duration, ease);
        return this;
    }

    public color(color: string): AreaShape {
        super.color(color);
        return this;
    }

    public interpolation(interpolation: string): AreaShape {
        this._interpolation = interpolation;
        return this;
    }

    public labels(format: string, rotate: boolean, visible: boolean): AreaShape {
        super.labels(format, rotate, visible);
        return this;
    }

    public opacity(opacity: number): AreaShape {
        super.opacity(opacity);
        return this;
    }

    public x(x: (d: IDatum, i: number, s: number) => number): AreaShape {
        super.x(x);
        return this;
    }

    public y(y: (d: IDatum, i: number, s: number) => number): AreaShape {
        super.y(y);
        return this;
    }

    public y0(y0: (d: IDatum, i: number, s: number) => number): AreaShape {
        this._y0 = y0;
        return this;
    }

    public y1(y1: (d: IDatum, i: number, s: number) => number): AreaShape {
        this._y1 = y1;
        return this;
    }
}
