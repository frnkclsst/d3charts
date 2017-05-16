"use strict";

import * as d3 from "d3";
import * as Html from "./Html";
import { AxisType, GridLineType, OrientationType, ScaleType } from "./Enums";
import { IDatum, IAxisOptions } from "./IInterfaces";
import { XYChart } from "./XYChart";

export class Axis {
    public height: number;
    public isDataAxis: boolean;
    public labels: {
        format: string;
        rotate: number;
    };
    public name: string;
    public scale: any;
    public title: {
        align: string,
        text: string,
        valign: string
    };
    public type: AxisType;
    public width: number;

    protected _axis: d3.svg.Axis;
    protected _chart: XYChart;
    protected _gridlineType: GridLineType;
    protected _hasTickmarks: boolean;
    protected _orient: OrientationType;
    protected _svgAxis: d3.Selection<SVGElement>;
    protected _svgGrid: d3.Selection<SVGElement>;
    protected _svgTitle: d3.Selection<SVGElement>;
    protected _svgZeroLine: d3.Selection<SVGElement>;

    private _innerTicksize: number;
    private _outerTicksize: number;
    private _scaleType: ScaleType;
    private _ticks: number;

    constructor(chart: XYChart, options: IAxisOptions) {
        this._axis = null;
        this._chart = chart;
        this.height = 0;
        this.isDataAxis = false;
        this.labels = {
            format: options.labels.format,
            rotate: options.labels.rotate
        };
        this._orient = null;
        this.scale = null;
        this._svgAxis = null;
        this._svgGrid = null;
        this._svgTitle = null;
        this._svgZeroLine = null;
        this.title = {
            align: options.title.align,
            text: options.title.text,
            valign: options.title.valign
        };
        this.width = 0;
        this._ticks = null;
    }

    public alignTitle(): void {
        // child classes are responsible for implementing this method
    }

    public draw(): void {
        this.initialize();

        // calculate scale
        this._axis.scale(this.scale);

        // draw axis
        this._svgAxis
            .call(this._axis)
            .attr("transform", "translate(" + this.getXCoordinate() + "," + this.getYCoordinate() + ")");

        // align tick labels
        if (this.labels.rotate % 360 != 0) {
            this._svgAxis.selectAll(".tick").selectAll("text")
                .style("alignment-baseline", "middle")
                .style("text-anchor", "end")
                .attr("y", "0")
                .attr("dy", "0");
        }

        // align axis title
        this.alignTitle();
        this.drawGridlines(this._axis);
        this.drawZeroLine(this._svgAxis);

        //this.removeOverlappingTicks();
    }

    public drawGridlines(axis: d3.svg.Axis): void {
        this._svgGrid = this._svgAxis.append("g")
            .attr("class", "grid");

        switch (this.getGridlineType()) {
            case GridLineType.Major:
                this._svgGrid.call(axis
                    .tickSize(this._innerTicksize, this._outerTicksize)
                    .tickFormat((d: IDatum): string => { return ""; }) // return no label for the grid lines
                );
                break;
            case GridLineType.Minor:
                // TODO - minor gridlines
                break;
            default:
                // Do nothing
                break;
        }
    }

    public drawTitle(svg: d3.Selection<SVGElement>): void {
        this._svgTitle = svg.append("text")
            .text(this.title.text)
            .attr("class", "title");
    }

    public drawZeroLine(svg: d3.Selection<SVGElement>): void {
        if (this.isDataAxis && this._chart.series.min() < 0) {
            this._svgZeroLine = this._svgGrid.append("g")
                .attr("class", "zero-line")
                .append("line");
        }
    }

    public getGridlineType(): GridLineType {
        return this._gridlineType;
    }

    public getInnerTicksize(): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public getOuterTicksize(): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public getScale(): any {
        // child classes are responsible for implementing this method
    }

    public getScaleType(): ScaleType {
        return this._scaleType;
    }

    public getTicks(): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public getXCoordinate(): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public getYCoordinate(): number {
        // child classes are responsible for implementing this method
        return 0;
    }

    public initialize(): void {
        this.scale = this.getScale();
        this._innerTicksize = this.getInnerTicksize();
        this._outerTicksize = this.getOuterTicksize();
        this._ticks = this.getTicks();
    }

    public removeOverlappingTicks(): void {
        // child classes are responsible for implementing this method
    }

    public rotateLabels(svg: d3.Selection<SVGElement>): void {
        // child classes are responsible for implementing this method
    }

    public setColor(color: string): void {
        var element: Element = <Element>this._svgAxis.selectAll("path")[0][0];
        element.setAttribute("style", "stroke: " + color);
    }

    protected _setGridlineType(type: string): void {
        switch (type.toUpperCase()) {
            case "MAJOR":
                this._gridlineType = GridLineType.Major;
                break;
            case "MINOR":
                this._gridlineType = GridLineType.Minor;
                break;
            default:
                this._gridlineType = GridLineType.None;
                break;
        }
    }

    public setScaleType(value: ScaleType): void {
        this._scaleType = value;
    }

    public setSize(): void {
        this.initialize();

        // create d3 axis
        this._axis = d3.svg.axis()
            .scale(this.scale)
            .orient(this._orient)
            .ticks(this._ticks);

        // apply custom formatter
        if (this.labels.format != "") {
            this._axis.tickFormat(d3.format(this.labels.format));
        }

        // draw tick marks
        if (this._hasTickmarks != true) {
            this._axis.tickSize(0);
            this._axis.tickPadding(12);
        }

        // draw axis
        this._svgAxis = this._chart.canvas.plotArea.svg.append("g")
            .attr("class", "axis");

        this._svgAxis.append("g")
            .attr("class", "ticks")
            .call(this._axis);

        this.rotateLabels(this._svgAxis);
        this.drawTitle(this._svgAxis);

        // store height and width
        this.height = Html.getHeight(this._svgAxis);
        this.width = Html.getWidth(this._svgAxis);
    }
}

export class XAxis extends Axis {

    constructor(chart: XYChart, options: IAxisOptions) {
        super(chart, options);

        this._hasTickmarks = options.tickmarks;
        this.name = options.name;
        this.setOrientation(options.orient);
        this._setGridlineType(options.gridlines);
        this.type = AxisType.X;
    }

    public alignTitle(): void {
        // TODO - refactor alignTitle - messy
        if (this.title.align === "left") {
            this._svgTitle.attr("x", this._chart.canvas.plotArea.axisSize.left);
        }
        else if (this.title.align === "center") {
            this._svgTitle.attr("x", 0);
        }
        else {
            this._svgTitle.attr("x", -this._chart.canvas.plotArea.axisSize.right);
        }
    }

    public drawTitle(svg: d3.Selection<SVGElement>): void {
        super.drawTitle(svg);

        var x = Html.align(this._svgTitle, Html.getWidth(this._svgAxis), this.title.align, 0),
            y = Html.getHeight(this._svgAxis) + 12;

        if (this._orient === "top") {
            y = -y;
        }

        this._svgTitle
            .attr("text-anchor", "begin")
            .attr("transform", "translate(" + x + "," + y + ")");
    }

    public drawZeroLine(svg: d3.Selection<SVGElement>): void {
        super.drawZeroLine(svg);
        if (this.isDataAxis && this._chart.series.min() < 0) {
            this._svgZeroLine
                .attr("x1", this.scale(0))
                .attr("x2", this.scale(0))
                .attr("y1", 0)
                .attr("y2", this._orient === "bottom" ? -this._chart.canvas.plotArea.height : this._chart.canvas.plotArea.height);
        }
    }

    public getInnerTicksize(): number {
        return -this._chart.canvas.plotArea.height;
    }

    public getOuterTicksize(): number {
        return -this._chart.canvas.plotArea.height;
    }

    public getScale(): any {
        return this._chart.getXScale(this);
    }

    public setSize(): void {
        super.setSize();

        if (this._orient === "bottom") {
            this._chart.canvas.plotArea.axisSize.bottom += this.height;
        }
        else {
            this._chart.canvas.plotArea.axisSize.top += this.height;
        }

        this._chart.canvas.plotArea.height -= this.height;
    }

    public getTicks(): number {
        return Math.max(this._chart.canvas.plotArea.width / 50, 2);
    }

    public getXCoordinate(): number {
        return 0;
    }

    public getYCoordinate(): number {
        return this._orient === "bottom" ? this._chart.canvas.plotArea.axisSize.top + this._chart.canvas.plotArea.height : this._chart.canvas.plotArea.axisSize.top;
    }

    // TODO - improve removeOverlappingTicks on X-axis
    public removeOverlappingTicks(): void {
        var ticks = this._svgAxis.selectAll("g.ticks").selectAll("g.tick"),
            tickOverlap = false,
            prevRight = 0;

        for (var i = 0; i < ticks[0].length - 1; i++) {
            var ticksElement = <SVGElement>ticks[0][i];
            var left = ticksElement.getBoundingClientRect().left;
            var right = ticksElement.getBoundingClientRect().right;
            if (prevRight > left) {
                tickOverlap = true;
            }
            else {
                prevRight = right;
            }
        }

        for (var j = 0; j < ticks[0].length; j++) {
            if (tickOverlap && Math.abs(j % 2) === 1) {
                ticksElement = <SVGElement>ticks[0][j];
                ticksElement.setAttribute("style", "opacity: 0");
            }
        }
    }

    public rotateLabels(svg: d3.Selection<SVGElement>): void {
        var _self = this,
            text: d3.Selection<SVGElement>,
            y: number;

        if (this.labels.rotate != 0) {
            svg.selectAll("text")
                .each(function(): void {
                    text = d3.select(this);
                    y = Number(text.attr("y"));

                    text
                        .style("alignment-baseline", "middle")
                        .style("text-anchor", "end")
                        .attr("y", "0")
                        .attr("dy", "0")
                        .attr("transform", "translate(" + 0 + ", " + 0 + ")");

                    if (_self._orient === "bottom") {
                        if (_self.labels.rotate > 0) {
                            _self.labels.rotate = -_self.labels.rotate;
                        }
                    }

                    if (_self._orient === "top") {
                        if (_self.labels.rotate < 0) {
                            _self.labels.rotate = -_self.labels.rotate;
                        }
                    }

                    text
                        .attr("transform", "translate(" + 0 + ", " + y + ") rotate(" + _self.labels.rotate + ")");
                });
        }
    }

    public setOrientation(value: OrientationType): void {
        switch (value.toUpperCase()) {
            case "BOTTOM":
                this._orient = "bottom";
                break;
            case "TOP":
                this._orient = "top";
                break;
            default:
                this._orient = "bottom";
                break;
        }
    }
}

export class YAxis extends Axis {
    constructor(chart: XYChart, options: IAxisOptions) {
        super(chart, options);

        this._hasTickmarks = options.tickmarks;
        this.name = options.name;
        this.setOrientation(options.orient);
        this._setGridlineType(options.gridlines);
        this.type = AxisType.Y;
    }

    public alignTitle(): void {
        // TODO - refactor alignTitle - messy
        if (this._orient === "left") {
            if (this.title.valign === "top") {
                this._svgTitle.attr("x", -this._chart.canvas.plotArea.axisSize.top);
            }
            else if (this.title.valign === "middle") {
                this._svgTitle.attr("x", -this._chart.canvas.plotArea.axisSize.top / 2);
            }
            else {
                this._svgTitle.attr("x", 0);
            }
        }
        else {
            if (this.title.valign === "top") {
                this._svgTitle.attr("x", this._chart.canvas.plotArea.axisSize.top);
            }
            else if (this.title.valign === "middle") {
                this._svgTitle.attr("x", this._chart.canvas.plotArea.axisSize.top / 2);
            }
            else {
                this._svgTitle.attr("x", 0);
            }
        }
    }

    public drawTitle(svg: d3.Selection<SVGElement>): void {
        super.drawTitle(svg);

        var rotation = this._orient === "left" ? -90 : 90;
        var textAnchor = this._orient === "left" ? "end" : "begin";

        this._svgTitle
            .attr("text-anchor", textAnchor)
            .attr("transform", "rotate(" + rotation + ")");

        var x = Html.getWidth(this._svgAxis) + 12;
        var y = Html.valign(this._svgTitle, Html.getHeight(this._svgAxis), this.title.valign, 0);

        if (this._orient === "left") {
            x = -x;
        }

        this._svgTitle
            .attr("transform", "translate(" + x + "," + y + ") rotate(" + rotation + ")");
    }

    public drawZeroLine(svg: d3.Selection<SVGElement>): void {
        super.drawZeroLine(svg);
        if (this.isDataAxis && this._chart.series.min() < 0) {
            this._svgZeroLine
                .attr("x1", 0)
                .attr("x2", this._orient === "left" ? this._chart.canvas.plotArea.width : -this._chart.canvas.plotArea.width)
                .attr("y1", this.scale(0))
                .attr("y2", this.scale(0));
        }
    }

    public getInnerTicksize(): number {
        return -this._chart.canvas.plotArea.width;
    }

    public getOuterTicksize(): number {
        return -this._chart.canvas.plotArea.width;
    }

    public getScale(): any {
        return this._chart.getYScale(this);
    }

    public setSize(): void {
        super.setSize();

        if (this._orient === "left") {
            this._chart.canvas.plotArea.axisSize.left += this.width;
        }
        else {
            this._chart.canvas.plotArea.axisSize.right += this.width;
        }
        this._chart.canvas.plotArea.width -= this.width;
    }

    public getTicks(): number {
        return Math.max(this._chart.canvas.plotArea.height / 50, 2);
    }

    public getXCoordinate(): number {
        return this._orient === "left" ? this._chart.canvas.plotArea.axisSize.left : this._chart.canvas.plotArea.axisSize.left + this._chart.canvas.plotArea.width;
    }

    public getYCoordinate(): number {
        return 0;
    }

    public removeOverlappingTicks(): void {
        // TODO - implement removeOverlappingTicks for Y-axis
    }

    public rotateLabels(svg: d3.Selection<SVGElement>): void {
        // TODO - implement label rotation for Y-axis
    }

    public setOrientation(value: OrientationType): void {
        switch (value.toUpperCase()) {
            case "LEFT":
                this._orient = "left";
                break;
            case "RIGHT":
                this._orient = "right";
                break;
            default:
                this._orient = "left";
                break;
        }
    }
}
