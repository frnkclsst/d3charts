"use strict";

import * as d3 from "d3";
import { IDatum } from "./IInterfaces";
import { AxisType } from "./Enums";
import { Shape } from "./Shape";
import { XYChart } from "./XYChart";

export class BarShape extends Shape {
    protected _chart: XYChart;
    protected _height: (d: IDatum, i: number, serie: number) => number;
    protected _width: (d: IDatum, i: number, serie: number) => number;

    constructor(svg: d3.Selection<SVGElement>, chart: XYChart, serie: number) {
        super(svg, chart, serie);
        this._chart = chart;
        this.height(null);
        this.width(null);
    }

    public draw(data: IDatum[]): void {
        var svgSerie = this._svg.append("g")
            .attr("id", "serie-" + this._serie)
            .selectAll("rect")
            .data(data)
            .enter();

        // draw bar
        var svgBar: d3.Selection<{}> = svgSerie.append("rect")
            .attr({
                "class": "bar",
                "fill": this._color,
                "height": (d: IDatum, i: number): number => {
                    return this._height(d, i, this._serie);
                },
                "stroke": this._color,
                "stroke-width": "1px",
                "width": 0,
                "x": (d: IDatum, i: number): number => {
                    if (d.y < 0) {
                        var index = this._chart.getAxisByName(AxisType.X, this._chart.series.items[this._serie].axis);
                        return this._chart.axes[index].scale(0);
                    }
                    else {
                        return this._x(d, i, this._serie);
                    }
                },
                "y": (d: IDatum, i: number): number => { return this._y(d, i, this._serie); }
            });

        // add animation
        var count = 0;
        svgBar
            .each((): void => {
                count++; // count number of bars
            })
            .transition()
            .duration(this._animation.duration)
            .ease(this._animation.ease)
            .attr("width", (d: IDatum, i: number): number => {
                return this._width(d, i, this._serie);
            })
            .attr("x", (d: IDatum, i: number): number => {
                return this._x(d, i, this._serie);
            })
            .each("end", (): void => {
                count--;
                if (this._labels.visible === true && !count) { // only draw labels after all transitions ended
                    this.drawLabels();
                }
            });

        // draw tooltip
        this._chart.tooltip.draw(svgBar, this._serie);
    }

    public drawLabels(): void {
        super.drawLabels();
        this._svg.selectAll("g#serie-" + this._serie).selectAll("rect")
            .each((d: IDatum, i: number): void => {
                var rotation = 0;
                var x = this._x(d, i, this._serie);
                var y = this._y(d, i, this._serie);
                var dx = 0;
                var dy = 0;

                if (this._labels.rotate === true) {
                    rotation = -90;
                }

                if (rotation != 0) {
                    dx = -this._height(d, i, this._serie) / 2;
                    dy = this._width(d, i, this._serie) / 2;
                }
                else {
                    dx = this._width(d, i, this._serie) / 2;
                    dy = this._height(d, i, this._serie) / 2;
                }

                this._svgLabels.append("text")
                    .text(d3.format(this._labels.format)(d.y))
                    .style("text-anchor", "middle")
                    .attr({
                        "alignment-baseline": "central",
                        "class": "label",
                        "fill": "#fff",
                        "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")",
                        "dx": dx,
                        "dy": dy
                    });
            });
    }

    public animation(duration: number, ease: string): BarShape {
        super.animation(duration, ease);
        return this;
    }

    public color(color: string): BarShape {
        super.color(color);
        return this;
    }

    public height(height: (d: IDatum, i: number, s: number) => number): BarShape {
        this._height = height;
        return this;
    }

    public labels(format: string, rotate: boolean, visible: boolean): BarShape {
        super.labels(format, rotate, visible);
        return this;
    }

    public opacity(opacity: number): BarShape {
        super.opacity(opacity);
        return this;
    }

    public width(width: (d: IDatum, i: number, s: number) => number): BarShape {
        this._width = width;
        return this;
    }

    public x(x: (d: IDatum, i: number, s: number) => number): BarShape {
        super.x(x);
        return this;
    }

    public y(y: (d: IDatum, i: number, s: number) => number): BarShape {
        super.y(y);
        return this;
    }
}
