"use strict";

import * as d3 from "d3";
import { MarkerType } from "./Enums";
import { IDatum } from "./IInterfaces";
import { Shape } from "./Shape";
import { XYChart } from "./XYChart";

export class BubbleShape extends Shape {
    protected _chart: XYChart;

    protected _marker: {
        type: MarkerType;
    };

    constructor(svg: d3.Selection<SVGElement>, chart: XYChart, serie: number) {
        super(svg, chart, serie);
        this._chart = chart;

        this._marker = {
            type: "circle"
        };
    }

    public draw(data: IDatum[]): void {
        var _self = this;

        var svgSerie = this._svg.append("g")
            .attr("id", "serie-" + (this._serie - 1))
            .selectAll("path")
            .data(data)
            .enter();

        var svgBubbles = svgSerie.append("path")
            .each(function(d: IDatum, i: number): void {
                d3.select(this)
                    .attr({
                        "class": "bubble",
                        "d": d3.svg.symbol()
                            .size(0)
                            .type(_self._marker.type)(0, 0),
                        "fill": _self._color,
                        "stroke": _self._color,
                        "stroke-width": 0,
                        "transform": "translate(" + _self._x(d, i, 0) + ", " + _self._y(d, i, _self._serie) + ")"
                    });
            });

        // add animation
        var count = 0;
        svgBubbles
            .each((): void => {
                count++; // count number of bars
            })
            .transition()
            .duration(this._animation.duration)
            .ease(this._animation.ease)
            .attr("d", (d: IDatum, i: number): string => {
                var size: number = _self._chart.series.items[this._serie].size != undefined ? _self._chart.series.items[this._serie].size[i] * 10 : 60;
                return d3.svg.symbol()
                    .size(size)
                    .type(_self._marker.type)(d, i);
            })
            .each("end", (): void => {
                count--;
                if (this._labels.visible === true && !count) { // only draw labels after all transitions ended
                    this.drawLabels();
                }
            });

        // draw tooltip
        this._chart.tooltip.draw(svgBubbles, this._serie);
    }

    public drawLabels(): void {
        this._svgLabels = this._svg.append("g")
            .attr("id", "labels-" + (this._serie - 1))
            .attr("opacity", "1");

        this._svg.selectAll("g#serie-" + (this._serie - 1)).selectAll("path.bubble")
            .each((d: IDatum, i: number): void => {
                var rotation = 0;
                var x = this._x(d, i, this._serie);
                var y = this._y(d, i, this._serie);
                var dx = 0;
                var dy = 0;

                if (this._labels.rotate === true) {
                    rotation = -90;
                }

                var text = this._svgLabels.append("text")
                    .text(d3.format(this._labels.format)(this._chart.series.items[this._serie].data[i]))
                    .style("text-anchor", "middle")
                    .attr({
                        "alignment-baseline": "central",
                        "class": "label",
                        "fill": "#fff",
                        "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                    });

                text
                    .attr("dy", dy)
                    .attr("dx", dx);
            });
    }

    public animation(duration: number, ease: string): BubbleShape {
        super.animation(duration, ease);
        return this;
    }

    public color(color: string): BubbleShape {
        super.color(color);
        return this;
    }

    public marker(type: MarkerType): BubbleShape {
        this._marker = {
            type: type
        };
        return this;
    }

    public labels(format: string, rotate: boolean, visible: boolean): BubbleShape {
        super.labels(format, rotate, visible);
        return this;
    }

    public opacity(opacity: number): BubbleShape {
        super.opacity(opacity);
        return this;
    }

    public x(x: (d: IDatum, i: number, s: number) => number): BubbleShape {
        super.x(x);
        return this;
    }

    public y(y: (d: IDatum, i: number, s: number) => number): BubbleShape {
        super.y(y);
        return this;
    }
}
