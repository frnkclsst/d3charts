"use strict";

import { AxisType, GridLineType, OrientationType, ScaleType } from "./Enums";
import { ColumnChart } from "./ColumnChart";
import { IAxisOptions } from "./IOptions";
import { LineChart } from "./LineChart";
import { XYChart } from "./XYChart";
import * as Html from "./Html";

export class Axis {
    public height: number;
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

    protected axis: D3.Svg.Axis;
    protected chart: XYChart;
    protected gridlineType: GridLineType;
    protected hasTickmarks: boolean;
    protected orient: OrientationType;
    protected svgAxis: D3.Selection;
    protected svgGrid: D3.Selection;
    protected svgTitle: D3.Selection;
    protected svgZeroLine: D3.Selection;

    private _innerTicksize: number;
    private _outerTicksize: number;
    private _scaleType: ScaleType;
    private _ticks: number;

    constructor(chart: XYChart, options: IAxisOptions) {
        this.axis = null;
        this.chart = chart;
        this.height = 0;
        this.labels = {
            format: options.labels.format,
            rotate: options.labels.rotate
        };
        this.orient = null;
        this.scale = null;
        this.svgAxis = null;
        this.svgGrid = null;
        this.svgTitle = null;
        this.svgZeroLine = null;
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
        this.axis.scale(this.scale);

        // draw axis
        this.svgAxis
            .call(this.axis)
            .attr("transform", "translate(" + this.getXCoordinate() + "," + this.getYCoordinate() + ")");

        // align tick labels
        if (this.labels.rotate % 360 != 0) {
            this.svgAxis.selectAll(".tick").selectAll("text")
                .style("alignment-baseline", "middle")
                .style("text-anchor", "end")
                .attr("y", "0")
                .attr("dy", "0");
        }

        // align axis title
        this.alignTitle();
        this.drawGridlines(this.axis);
        this.drawZeroLine(this.svgAxis);
        //this.removeOverlappingTicks();
    }

    public drawGridlines(axis: D3.Svg.Axis): void {
        this.svgGrid = this.svgAxis.append("g")
            .attr("class", "grid");

        switch (this.getGridlineType()) {
            case GridLineType.Major:
                this.svgGrid.call(axis
                    .tickSize(this._innerTicksize, this._outerTicksize)
                    .tickFormat((d: any): string => { return ""; }) // return no label for the grid lines
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

    public drawTitle(svg: D3.Selection): void {
        this.svgTitle = svg.append("text")
            .text(this.title.text)
            .attr("class", "title");
    }

    public drawZeroLine(svg: D3.Selection): void {
        if (this.isDataAxis() && this.chart.series.min() < 0) {
            this.svgZeroLine = this.svgGrid.append("g")
                .attr("class", "zero-line")
                .append("line");
        }
    }

    public getGridlineType(): GridLineType {
        return this.gridlineType;
    }

    public getInnerTicksize(): any {
        // child classes are responsible for implementing this method
    }

    public getOuterTicksize(): any {
        // child classes are responsible for implementing this method
    }

    public getScale(): any {
        // child classes are responsible for implementing this method
    }

    public getSize(): void {
        this.initialize();

        // create d3 axis
        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(this.orient)
            .ticks(this._ticks);

        // apply custom formatter
        if (this.labels.format != "") {
            this.axis.tickFormat(d3.format(this.labels.format));
        }

        // draw tick marks
        if (this.hasTickmarks != true) {
            this.axis.tickSize(0);
            this.axis.tickPadding(12);
        }

        // draw axis
        this.svgAxis = this.chart.canvas.plotArea.svg.append("g")
            .attr("class", "axis");

        this.svgAxis.append("g")
            .attr("class", "ticks")
            .call(this.axis);

        this.rotateLabels(this.svgAxis);
        this.drawTitle(this.svgAxis);

        // store height and width
        this.height = Html.getHeight(this.svgAxis);
        this.width = Html.getWidth(this.svgAxis);
    }

    public getScaleType(): ScaleType {
        return this._scaleType;
    }

    public getTicks(): any {
        // child classes are responsible for implementing this method
    }

    public getXCoordinate(): any {
        // child classes are responsible for implementing this method
    }

    public getYCoordinate(): any {
        // child classes are responsible for implementing this method
    }

    public initialize(): void {
        this.scale = this.getScale();
        this._innerTicksize = this.getInnerTicksize();
        this._outerTicksize = this.getOuterTicksize();
        this._ticks = this.getTicks();
    }

    public isDataAxis(): any {
        // child classes are responsible for implementing this method
    }

    public removeOverlappingTicks(): void {
        // child classes are responsible for implementing this method
    }

    public rotateLabels(svg: D3.Selection): void {
        // child classes are responsible for implementing this method
    }

    public setScaleType(value: ScaleType): void {
        this._scaleType = value;
    }

    public setColor(color: string): void {
        this.svgAxis.selectAll("path")[0][0].setAttribute("style", "stroke: " + color);
    }

    protected setGridlineType(type: string): void {
        switch (type.toUpperCase()) {
            case "MAJOR":
                this.gridlineType = GridLineType.Major;
                break;
            case "MINOR":
                this.gridlineType = GridLineType.Minor;
                break;
            default:
                this.gridlineType = GridLineType.None;
                break;
        }
    }
}

export class XAxis extends Axis {

    constructor(chart: XYChart, options: IAxisOptions) {
        super(chart, options);

        this.hasTickmarks = options.tickmarks;
        this.name = options.name;
        this.setOrientation(options.orient);
        this.setGridlineType(options.gridlines);
        this.type = AxisType.X;
    }

    public alignTitle(): void {
        // TODO - Refactor alignTitle - messy
        if (this.title.align === "left") {
            this.svgTitle.attr("x", this.chart.canvas.plotArea.axisSize.left);
        }
        else if (this.title.align === "center") {
            this.svgTitle.attr("x", 0);
        }
        else {
            this.svgTitle.attr("x", -this.chart.canvas.plotArea.axisSize.right);
        }
    }

    public drawTitle(svg: D3.Selection): void {
        super.drawTitle(svg);

        var x = Html.align(this.svgTitle, Html.getWidth(this.svgAxis), this.title.align, 0),
            y = Html.getHeight(this.svgAxis) + 12;

        if (this.orient === "top") {
            y = -y;
        }

        this.svgTitle
            .attr("text-anchor", "begin")
            .attr("transform", "translate(" + x + "," + y + ")");
    }

    public drawZeroLine(svg: D3.Selection): void {
        super.drawZeroLine(svg);
        if (this.isDataAxis() && this.chart.series.min() < 0) {
            this.svgZeroLine
                .attr("x1", this.scale(0))
                .attr("x2", this.scale(0))
                .attr("y1", 0)
                .attr("y2", this.orient === "bottom" ? -this.chart.canvas.plotArea.height : this.chart.canvas.plotArea.height);
        }
    }

    public getInnerTicksize(): number {
        return -this.chart.canvas.plotArea.height;
    }

    public getOuterTicksize(): number {
        return -this.chart.canvas.plotArea.height;
    }

    public getScale(): any {
        return this.chart.getXScale(this);
    }

    public getSize(): void {
        super.getSize();

        if (this.orient === "bottom") {
            this.chart.canvas.plotArea.axisSize.bottom += this.height;
        }
        else {
            this.chart.canvas.plotArea.axisSize.top += this.height;
        }

        this.chart.canvas.plotArea.height -= this.height;
    }

    public getTicks(): number {
        return Math.max(this.chart.canvas.plotArea.width / 50, 2);
    }

    public getXCoordinate(): number {
        return 0;
    }

    public getYCoordinate(): number {
        return this.orient === "bottom" ? this.chart.canvas.plotArea.axisSize.top + this.chart.canvas.plotArea.height : this.chart.canvas.plotArea.axisSize.top;
    }

    public isDataAxis(): boolean {
        if (this.chart instanceof LineChart || this.chart instanceof ColumnChart) {
            return false;
        }
        return true;
    }

    public removeOverlappingTicks(): void {
        // TODO - improve how overlapping ticks are removed
        var ticks = this.svgAxis.selectAll("g.ticks").selectAll("g.tick"),
            tickOverlap = false,
            prevRight = 0;

        for (var i = 0; i < ticks[0].length - 1; i++) {
            var left = ticks[0][i].getBoundingClientRect().left;
            var right = ticks[0][i].getBoundingClientRect().right;
            if (prevRight > left) {
                tickOverlap = true;
            }
            else {
                prevRight = right;
            }
        }

        for (var j = 0; j < ticks[0].length; j++) {
            if (tickOverlap && Math.abs(j % 2) === 1) {
                ticks[0][j].setAttribute("style", "opacity: 0");
            }
        }
    }

    public rotateLabels(svg: D3.Selection): void {
        var _self = this,
            text: D3.Selection,
            y: number;

        if (this.labels.rotate != 0) {
            svg.selectAll("text")
                .each(function(): void {
                    text = d3.select(this);
                    y = parseInt(text.attr("y"), 10);

                    text
                        .style("alignment-baseline", "middle")
                        .style("text-anchor", "end")
                        .attr("y", "0")
                        .attr("dy", "0")
                        .attr("transform", "translate(" + 0 + ", " + 0 + ")");

                    if (_self.orient === "bottom") {
                        if (_self.labels.rotate > 0) {
                            _self.labels.rotate = -_self.labels.rotate;
                        }
                    }

                    if (_self.orient === "top") {
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
                this.orient = "bottom";
                break;
            case "TOP":
                this.orient = "top";
                break;
            default:
                this.orient = "bottom";
                break;
        }
    }
}

export class YAxis extends Axis {
    constructor(chart: XYChart, options: IAxisOptions) {
        super(chart, options);

        this.hasTickmarks = options.tickmarks;
        this.name = options.name;
        this.setOrientation(options.orient);
        this.setGridlineType(options.gridlines);
        this.type = AxisType.Y;
    }

    public alignTitle(): void {
        // TODO - Refactor alignTitle - messy
        if (this.orient === "left") {
            if (this.title.valign === "top") {
                this.svgTitle.attr("x", -this.chart.canvas.plotArea.axisSize.top);
            }
            else if (this.title.valign === "middle") {
                this.svgTitle.attr("x", -this.chart.canvas.plotArea.axisSize.top / 2);
            }
            else {
                this.svgTitle.attr("x", 0);
            }
        }
        else {
            if (this.title.valign === "top") {
                this.svgTitle.attr("x", this.chart.canvas.plotArea.axisSize.top);
            }
            else if (this.title.valign === "middle") {
                this.svgTitle.attr("x", this.chart.canvas.plotArea.axisSize.top / 2);
            }
            else {
                this.svgTitle.attr("x", 0);
            }
        }
    }

    public drawTitle(svg: D3.Selection): void {
        super.drawTitle(svg);

        var rotation = this.orient === "left" ? -90 : 90;
        var textAnchor = this.orient === "left" ? "end" : "begin";

        this.svgTitle
            .attr("text-anchor", textAnchor)
            .attr("transform", "rotate(" + rotation + ")");

        var x = Html.getWidth(this.svgAxis) + 12;
        var y = Html.valign(this.svgTitle, Html.getHeight(this.svgAxis), this.title.valign, 0);

        if (this.orient === "left") {
            x = -x;
        }

        this.svgTitle
            .attr("transform", "translate(" + x + "," + y + ") rotate(" + rotation + ")");
    }

    public drawZeroLine(svg: D3.Selection): void {
        super.drawZeroLine(svg);
        if (this.isDataAxis() && this.chart.series.min() < 0) {
            this.svgZeroLine
                .attr("x1", 0)
                .attr("x2", this.orient === "left" ? this.chart.canvas.plotArea.width : -this.chart.canvas.plotArea.width)
                .attr("y1", this.scale(0))
                .attr("y2", this.scale(0));
        }
    }

    public getInnerTicksize(): number {
        return -this.chart.canvas.plotArea.width;
    }

    public getOuterTicksize(): number {
        return -this.chart.canvas.plotArea.width;
    }

    public getScale(): any {
        return this.chart.getYScale(this);
    }

    public getSize(): void {
        super.getSize();

        if (this.orient === "left") {
            this.chart.canvas.plotArea.axisSize.left += this.width;
        }
        else {
            this.chart.canvas.plotArea.axisSize.right += this.width;
        }
        this.chart.canvas.plotArea.width -= this.width;
    }

    public getTicks(): number {
        return Math.max(this.chart.canvas.plotArea.height / 50, 2);
    }

    public getXCoordinate(): number {
        return this.orient === "left" ? this.chart.canvas.plotArea.axisSize.left : this.chart.canvas.plotArea.axisSize.left + this.chart.canvas.plotArea.width;
    }

    public getYCoordinate(): number {
        return 0;
    }

    public isDataAxis(): boolean {
        if (this.chart instanceof ColumnChart || this.chart instanceof LineChart) {
            return true;
        }
        return false;
    }

    public removeOverlappingTicks(): void {
        // TODO - implement removeOverlappingTicks for Y-axis
    }

    public rotateLabels(svg: D3.Selection): void {
        // TODO - implement label rotation for Y-axis
    }

    public setOrientation(value: OrientationType): void {
        switch (value.toUpperCase()) {
            case "LEFT":
                this.orient = "left";
                break;
            case "RIGHT":
                this.orient = "right";
                break;
            default:
                this.orient = "left";
                break;
        }
    }
}
