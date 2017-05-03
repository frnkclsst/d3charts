"use strict";

import { AxisType, MarkerType, ScaleType } from "./Enums";
import { IData, IOptions } from "./IOptions";
import { XYChart } from "./XYChart";
import { SVGArea } from "./Shape.Area";
import { SVGLine } from "./Shape.Line";

export class LineChart extends XYChart {
    public area: {
        visible: boolean,
        opacity: number
    };
    public interpolation: string;
    public markers: {
        visible: boolean,
        size: number,
        type: MarkerType
    };

    constructor(selector: string, data: IData, options?: IOptions) {
        super(selector, data, options);
        this.area = {
            visible: this.options.plotOptions.area.visible,
            opacity: this.options.plotOptions.area.opacity
        };
        this.interpolation = this.options.plotOptions.line.interpolation;
        this.markers = {
            visible: this.options.plotOptions.markers.visible,
            size: this.options.plotOptions.markers.size,
            type: this.options.plotOptions.markers.type
        };
    }

    public draw(): void {
        super.draw();

        var svgSeries = this.canvas.plotArea.svg.append("g")
            .attr("class", "series");

        // draw areas
        // areas need to be drawn first, because the line and markers need to be drawn on top of it
        if (this.area.visible === true) {
            for (var areaSerie = 0; areaSerie < this.series.length; areaSerie++) {
                var area = new SVGArea(svgSeries, this, areaSerie);
                area.animation = {
                    duration: this.options.plotOptions.animation.duration,
                    ease: this.options.plotOptions.animation.ease
                };
                area.color = this.colorPalette.color(areaSerie);
                area.opacity = this.area.opacity;
                area.interpolation = this.interpolation;
                area.x = (d: any, i: number, s: number): number => {
                    return this.getXCoordinate(d, i, s);
                };
                area.y = (d: any, i: number, s: number): number => {
                    return this.getYCoordinate(d, i, s);
                };
                area.y0 = (d: any, i: number, s: number): number => {
                    return this.getY0Coordinate(d, i, s);
                };
                area.y1 = (d: any, i: number, s: number): number => {
                    return this.getY1Coordinate(d, i, s);
                };
                area.draw(this.series.getMatrixItem(areaSerie));
            }
        }

        // draw lines
        for (var serie = 0; serie < this.series.length; serie++) {
            if (this.series.items[serie].data.length != 0) {
                var line = new SVGLine(svgSeries, this, serie);
                line.animation = {
                    duration: this.options.plotOptions.animation.duration,
                    ease: this.options.plotOptions.animation.ease
                };
                line.color = this.colorPalette.color(serie);
                line.interpolation = this.interpolation;
                line.labels = {
                    format: this.series.items[serie].format,
                    rotate: this.options.series.labels.rotate,
                    visible: this.options.series.labels.visible
                };
                line.marker = {
                    visible: this.markers.visible,
                    size: this.markers.size,
                    type: this.series.items[serie].marker
                };
                line.x = (d: any, i: number, s: number): number => {
                    return this.getXCoordinate(d, i, s);
                };
                line.y = (d: any, i: number, s: number): number => {
                    return this.getYCoordinate(d, i, s);
                };
                line.draw(this.series.getMatrixItem(serie));
            }
        }
    }

    public getXCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
        var axis = this.axes[index];

        if (axis.getScaleType() === ScaleType.Ordinal) {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
        }
        else {
            return axis.scale(this.categories.parseFormat(this.categories.getItem(i)));
        }
    }

    public getYCoordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.y);
    }

    public getY0Coordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.y0);
    }

    public getY1Coordinate(d: any, i: number, serie: number): any {
        var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
        var axis = this.axes[index];

        return axis.scale(d.y1);
    }
}

// draw tooltip line
/* TODO - improve tooltips for line charts
 - code below only works if ordinal scale
 - need to use invert method to discover domain value in a linear scale

 var _self = this;
 svgSeries.append("line").attr("id", "tooltipLine");

 var overlay = this.canvas.svg
 .append("rect")
 .attr("class", "overlay")
 .attr("width", _self.canvas.plotArea.width)
 .attr("height", _self.canvas.plotArea.height)
 .attr("opacity", "0")
 .attr("transform", "translate(" + (_self.canvas.plotArea.padding + _self.canvas.plotArea.axisSize.left) + ", "
 + (_self.canvas.titleArea.height + _self.canvas.plotArea.padding) + ")")
 .on("mousemove", function (): void {
 if (_self instanceof LineChart) {
 var mouseX = d3.mouse(this)[0];
 var leftEdges = _self.xAxes[0].scale.range();
 var width = _self.xAxes[0].scale.rangeBand();
 var domainValue = "";
 for (var j = 0; j < leftEdges.length; j++) {
 var threshold = leftEdges[j] - width / 2;
 if (mouseX > threshold) {
 domainValue = _self.xAxes[0].scale.domain()[j];
 }
 }
 var left = _self.xAxes[0].scale(domainValue) + width / 2;

 svgSeries.select("#tooltipLine")
 .attr("x1", left)
 .attr("x2", left)
 .attr("y1", "0")
 .attr("y1", _self.canvas.plotArea.height)
 .attr("stroke", "#ddd");
 }
 });
 */
