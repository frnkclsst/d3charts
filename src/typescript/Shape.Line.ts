"use strict";

import * as d3 from "d3";
import * as Html from "./Html";
import { MarkerType } from "./Enums";
import { IDatum } from "./IInterfaces";
import { Shape } from "./Shape";
import { XYChart } from "./XYChart";

export class LineShape extends Shape {
    protected _chart: XYChart;
    protected _interpolation: string;
    protected _marker: {
        size: number;
        type: MarkerType;
        visible: boolean;
    };

    constructor(svg: d3.Selection<SVGElement>, chart: XYChart, serie: number) {
        super(svg, chart, serie);
        this._chart = chart;

        this.interpolation("linear");
        this.marker(6, "circle", true);
    }

    public draw(data: any): void {
        var count: number,
            line: d3.svg.Line<any>,
            svgPath: d3.Selection<SVGElement>,
            svgPathElement: SVGPathElement,
            svgPathLenght: number,
            svgSerie: d3.Selection<SVGElement>;

        line = d3.svg.line()
            .interpolate(this._interpolation)
            .x((d: any, i: number): number => {
                return this._x(d, i, this._serie);
            })
            .y((d: any, i: number): number => {
                return this._y(d, i, this._serie);
            });

        svgSerie = this._svg.append("g")
            .attr("id", "serie-" + this._serie);

        svgPath = svgSerie.append("path")
            .attr("class", "line")
            .attr("d", line(data))
            .attr("stroke", this._color)
            .attr("stroke-width", 1)
            .attr("fill", "none");

        // add animation
        svgPathElement = <SVGPathElement>svgPath[0][0];
        svgPathLenght = svgPathElement.getTotalLength();
        count = 0;
        svgPath
            .each((): void => {
                count++; // count number of bars
            })
            .attr("stroke-dasharray", svgPathLenght + " " + svgPathLenght)
            .attr("stroke-dashoffset", svgPathLenght)
            .transition()
            .duration(this._animation.duration)
            .ease(this._animation.ease)
            .attr("stroke-dashoffset", 0)
            .each("end", (): void => {
                count--;
                // draw markers
                if (this._marker.visible === true) {
                    var svgMarkers =  this.drawMarkers(data);

                    // draw tooltip
                    this._chart.tooltip.draw(svgMarkers, this._serie);
                }

                // draw labels
                if (this._labels.visible === true && !count) {
                    this.drawLabels();
                }
            });
    }

    public animation(duration: number, ease: string): LineShape {
        super.animation(duration, ease);
        return this;
    }

    public color(color: string): LineShape {
        super.color(color);
        return this;
    }

    public interpolation(interpolation: string): LineShape {
        this._interpolation = interpolation;
        return this;
    }

    public labels(format: string, rotate: boolean, visible: boolean): LineShape {
        super.labels(format, rotate, visible);
        return this;
    }

    public marker(size: number, type: MarkerType, visible: boolean): LineShape {
        this._marker = {
            size: size,
            type: type,
            visible: visible
        };
        return this;
    }

    public opacity(opacity: number): LineShape {
        super.opacity(opacity);
        return this;
    }

    public x(x: (d: IDatum, i: number, s: number) => number): LineShape {
        super.x(x);
        return this;
    }

    public y(y: (d: IDatum, i: number, s: number) => number): LineShape {
        super.y(y);
        return this;
    }

    protected drawLabels(): void {
        this._svgLabels = this._svg.append("g")
            .attr("id", "labels-" + this._serie)
            .attr("opacity", "1");

        this._svg.selectAll("g#serie-" + this._serie).selectAll("path.marker")
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
                    .text(d3.format(this._labels.format)(d.y))
                    .style("text-anchor", "middle")
                    .attr({
                        "alignment-baseline": "central",
                        "class": "label",
                        "fill": "#fff",
                        "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                    });

                if (rotation != 0) {
                    dx = Html.getHeight(text) + this._marker.size / 2;
                }
                else {
                    dy = -Html.getHeight(text) - this._marker.size / 2;
                }

                text
                    .attr("dy", dy)
                    .attr("dx", dx);
            });
    }

    protected drawMarkers(data: any): any {
        return this._svg.selectAll("g#serie-" + this._serie).selectAll(".marker")
            .data(data)
            .enter()
            .append("path")
            .attr({
                "class": "marker",
                "stroke": this._color,
                "stroke-width": 0,
                "d": d3.svg.symbol()
                    .size(this._marker.size * 10)
                    .type(this._marker.type)(0, 0),
                "transform": (d: IDatum, i: number): string => {
                    return "translate(" + this._x(d, i, this._serie) + ", " + this._y(d, i, this._serie) + ")";
                }
            });
    }
}
