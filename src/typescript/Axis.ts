/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Axis {
        public format: string;
        public height: number;
        public name: string;
        public scale: any;
        public width: number;

        protected align: string;
        protected axis: D3.Svg.Axis;
        protected chart: Chart;
        protected gridlineType: GridLineType;
        protected hasTickmarks: boolean;
        protected orient: OrientationType;
        protected svgAxis: D3.Selection;
        protected svgGrid: D3.Selection;
        protected svgTitle: D3.Selection;
        protected svgZeroLine: D3.Selection;
        protected textRotation: number;
        protected title: string;
        protected valign: string;

        private _innerTicksize: number;
        private _outerTicksize: number;
        private _scaleType: ScaleType;
        private _ticks: number;

        constructor(settings: IAxisSettings, chart: Chart) {
            this.axis = null;
            this.chart = chart;
            this.format = settings.labels.format;
            this.height = 0;
            this.orient = null;
            this.scale = null;
            this.svgAxis = null;
            this.svgGrid = null;
            this.svgTitle = null;
            this.svgZeroLine = null;
            this.width = 0;
            this._ticks = null;
        }

        public draw(chart: Chart): void {
            this.initialize();

            // create d3 axis
            this.axis = d3.svg.axis()
                .scale(this.scale)
                .orient(this.orient)
                .ticks(this._ticks);

            // apply custom formatter
            if (this.format != "") {
                this.axis.tickFormat(d3.format(this.format));
            }

            // draw tick marks
            if (this.hasTickmarks != true) {
                this.axis.tickSize(0);
                this.axis.tickPadding(12);
            }

            // draw axis
            this.svgAxis = chart.canvas.plotArea.svg.append("g")
                .attr("class", "axis");

            this.svgAxis.append("g")
                .attr("class", "ticks")
                .call(this.axis);

            this.rotateLabels(chart, this.svgAxis);
            this.drawTitle(chart, this.svgAxis);

            // store height and width
            this.height = Html.getHeight(this.svgAxis);
            this.width = Html.getWidth(this.svgAxis);
        }

        public drawGridlines(chart: Chart, axis: D3.Svg.Axis): void {
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
                    // TODO - Minor Gridlines
                    break;
                default:
                    // Do nothing
                    break;
            }
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            this.svgTitle = svg.append("text")
                .text(this.title)
                .attr("class", "title");
        }

        public drawZeroLine(chart: Chart, svg: D3.Selection): void {
            if (this.isDataAxis() && chart.series.getMinValue() < 0) {
                this.svgZeroLine = this.svgGrid.append("g")
                    .attr("class", "zero-line")
                    .append("line");
            }
        }

        public getGridlineType(): GridLineType {
            return this.gridlineType;
        }

        public getInnerTicksize(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getOuterTicksize(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getScale(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getScaleType(): ScaleType {
            return this._scaleType;
        }

        public getTicks(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getXCoordinate(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getYCoordinate(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public initialize(): void {
            this.scale = this.getScale(this.chart);
            this._innerTicksize = this.getInnerTicksize(this.chart);
            this._outerTicksize = this.getOuterTicksize(this.chart);
            this._ticks = this.getTicks(this.chart);
        }

        public isDataAxis(): any {
            // child classes are responsible for implementing this method
        }

        public resizeToFit(): void {
            this.initialize();

            // recalculate scale
            this.axis.scale(this.scale);

            // redraw axis
            this.svgAxis
                .call(this.axis)
                .attr("transform", "translate(" + this.getXCoordinate(this.chart) + "," + this.getYCoordinate(this.chart) + ")");

            // realign tick labels
            if (this.textRotation % 360 != 0) {
                this.svgAxis.selectAll("text")
                    .style("alignment-baseline", "middle")
                    .style("text-anchor", "end")
                    .attr("y", "0")
                    .attr("dy", "0");
            }

            // TODO - Realign axis title
            // TODO - Refactor - not a logical place for these two functions to be
            this.drawGridlines(this.chart, this.axis);
            this.drawZeroLine(this.chart, this.svgAxis);
            this.removeOverlappingTicks();
        }

        public removeOverlappingTicks(): void {
            // child classes are responsible for implementing this method
        }

        public rotateLabels(chart: Chart, svg: D3.Selection): void {
            // child classes are responsible for implementing this method
        }

        public setScaleType(value: ScaleType): void {
            this._scaleType = value;
        }

        public setColor(chart: Chart, color: string): void {
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

        constructor(settings: IAxisSettings, chart: Chart) {
            super(settings, chart);

            this.hasTickmarks = settings.tickmarks;
            this.name = settings.name;
            this.setOrientation(settings.orient);
            this.setGridlineType(settings.gridlines);
            this.textRotation = settings.labels.rotate;
            this.title = settings.title.text;
            this.align = settings.title.align;
        }

        public draw(chart: Chart): void {
            super.draw(this.chart);

            if (this.orient === "bottom") {
                this.chart.canvas.plotArea.axisSize.bottom += this.height;
            }
            else {
                this.chart.canvas.plotArea.axisSize.top += this.height;
            }

            this.chart.canvas.plotArea.height -= this.height;
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            super.drawTitle(chart, svg);

            var x = Html.align(this.svgTitle, Html.getWidth(this.svgAxis), this.align, 0);
            var y = Html.getHeight(this.svgAxis) + 5;

            if (this.orient === "top") {
                y = -y;
            };

            this.svgTitle
                .attr("text-anchor", "left")
                .attr("transform", "translate(" + x + "," + y + ")");
        }

        public drawZeroLine(chart: Chart, svg: D3.Selection): void {
            super.drawZeroLine(chart, svg);
            if (this.isDataAxis() && chart.series.getMinValue() < 0) {
                this.svgZeroLine
                    .attr("x1", this.scale(0))
                    .attr("x2", this.scale(0))
                    .attr("y1", 0)
                    .attr("y2", this.orient === "bottom" ? -chart.canvas.plotArea.height : chart.canvas.plotArea.height);
            }
        }

        public getInnerTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.height;
        }

        public getOuterTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.height;
        }

        public getScale(chart: Chart): any {
            var min = chart.series.getMinValue(this.name);
            var max = chart.series.getMaxValue(this.name);
            var start = this.chart.canvas.plotArea.axisSize.left;
            var end =  this.chart.canvas.plotArea.axisSize.left + chart.canvas.plotArea.width;

            if (chart instanceof StackedPercentBarChart) {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([min < 0 ? -1 : 0, 1])
                    .range([start, end]);
            }
            else if (chart instanceof BarChart) {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([min < 0 ? min : 0, max])
                    .nice() // adds additional ticks to add some whitespace
                    .range([start, end]);
            }
            else {
                if (chart.categories.format === "%s") {
                    this.setScaleType(ScaleType.Ordinal);
                    return d3.scale.ordinal()
                        .domain(chart.categories.getLabels())
                        .rangeBands([start, end], chart.settings.plotOptions.innerPadding, chart.settings.plotOptions.outerPadding);
                }
                else {
                    this.setScaleType(ScaleType.Time);
                    return d3.time.scale()
                        .domain(d3.extent(chart.categories.getLabels(), (d: any): Date => {
                            return d3.time.format(chart.categories.format).parse(d);
                        }))
                        .nice() // adds additional ticks to add some whitespace
                        .range([start, end]);
                }
            }
        }

        public getTicks(chart: Chart): number {
            return Math.max(chart.canvas.plotArea.width / 50, 2);
        }

        public getXCoordinate(chart: Chart): number {
            return 0;
        }

        public getYCoordinate(chart: Chart): number {
            return this.orient === "bottom" ? chart.canvas.plotArea.axisSize.top + chart.canvas.plotArea.height : chart.canvas.plotArea.axisSize.top;
        }

        public isDataAxis(): boolean {
            if (this.chart instanceof LineChart || this.chart instanceof ColumnChart) {
                return false;
            }
            return true;
        }

        public removeOverlappingTicks(): void {
            // TODO - Below is an implementation that should be refactored
            // TODO - doesn't work anymore
            var ticks = this.svgAxis.selectAll("g.ticks").selectAll("g.tick");
            var tickOverlap = false;
            var prevRight = 0;
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

        public rotateLabels(chart: Chart, svg: D3.Selection): void {
            var _self = this;
            if (this.textRotation != 0) {
                svg.selectAll("text")
                    .each(function(): void {
                        var text = d3.select(this);
                        //var x = Number(text.attr("x"));
                        var y = Number(text.attr("y"));

                        text
                            .style("alignment-baseline", "middle")
                            .style("text-anchor", "end")
                            .attr("y", "0")
                            .attr("dy", "0")
                            .attr("transform", "translate(" + 0 + ", " + 0 + ")");

                        if (_self.orient === "bottom") {
                            if (_self.textRotation > 0) {
                                _self.textRotation = -_self.textRotation;
                            }
                        }

                        if (_self.orient === "top") {
                            if (_self.textRotation < 0) {
                                _self.textRotation = -_self.textRotation;
                            }
                        }

                        text
                            .attr("transform", "translate(" + 0 + ", " + y + ") rotate(" + _self.textRotation + ")");
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
        constructor(settings: IAxisSettings, chart: Chart) {
            super(settings, chart);

            this.hasTickmarks = settings.tickmarks;
            this.name = settings.name;
            this.setOrientation(settings.orient);
            this.setGridlineType(settings.gridlines);
            this.textRotation = settings.labels.rotate;
            this.title = settings.title.text;
            this.valign = settings.title.valign;
        }

        public draw(chart: Chart): void {
            super.draw(chart);

            if (this.orient === "left") {
                this.chart.canvas.plotArea.axisSize.left += this.width;
            }
            else {
                this.chart.canvas.plotArea.axisSize.right += this.width;
            }
            this.chart.canvas.plotArea.width -= this.width;
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            super.drawTitle(chart, svg);

            var rotation = this.orient === "left" ? -90 : 90;
            this.svgTitle
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(" + rotation + ")");

            var x = Html.getWidth(this.svgAxis) + 5;
            var y = Html.valign(this.svgTitle, Html.getHeight(this.svgAxis), this.valign, 0);

            if (this.orient === "left") {
                x = -x;
            }

            this.svgTitle
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + x + "," + y + ") rotate(" + rotation + ")");
        }

        public drawZeroLine(chart: Chart, svg: D3.Selection): void {
            super.drawZeroLine(chart, svg);
            if (this.isDataAxis() && chart.series.getMinValue() < 0) {
                this.svgZeroLine
                    .attr("x1", 0)
                    .attr("x2", this.orient === "left" ? chart.canvas.plotArea.width : -chart.canvas.plotArea.width)
                    .attr("y1", this.scale(0))
                    .attr("y2", this.scale(0));
            }
        }

        public getInnerTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.width;
        }

        public getOuterTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.width;
        }

        public getScale(chart: Chart): any {
            var min = chart.series.getMinValue(this.name);
            var max = chart.series.getMaxValue(this.name);
            var start = chart.canvas.plotArea.axisSize.top;
            var end = chart.canvas.plotArea.axisSize.top + chart.canvas.plotArea.height;

            if (this.chart instanceof StackedPercentColumnChart ||
                this.chart instanceof StackedPercentLineChart) {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([1, min < 0 ? -1 : 0])
                    .range([start, end]);
            }
            else if (this.chart instanceof BarChart) {
                if (chart.categories.format === "%s") {
                    this.setScaleType(ScaleType.Ordinal);
                    return d3.scale.ordinal()
                        .domain(chart.categories.getLabels())
                        .rangeRoundBands([start, end], chart.settings.plotOptions.innerPadding, chart.settings.plotOptions.outerPadding);
                }
                else {
                    this.setScaleType(ScaleType.Time);
                    return d3.time.scale()
                        .domain(d3.extent(chart.categories.getLabels(), (d: any): Date => {
                            return d3.time.format(chart.categories.format).parse(d);
                        }).reverse())
                        .nice() // adds additional ticks to add some whitespace
                        .range([min, chart.canvas.plotArea.height]); // TODO - dynamic placement
                }
            }
            else {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([max, min < 0 ? min : 0])
                    .nice() // adds additional ticks to add some whitespace
                    .range([start, end]);
            }
        }

        public getTicks(chart: Chart): number {
            return Math.max(chart.canvas.plotArea.height / 50, 2);
        }

        public getXCoordinate(chart: Chart): number {
            return this.orient === "left" ? chart.canvas.plotArea.axisSize.left : chart.canvas.plotArea.axisSize.left + chart.canvas.plotArea.width;
        }

        public getYCoordinate(chart: Chart): number {
            return 0;
        }

        public isDataAxis(): boolean {
            if (this.chart instanceof ColumnChart || this.chart instanceof LineChart) {
                return true;
            }
            return false;
        }

        public removeOverlappingTicks(): void {
            // TODO - Implement removeOverlappingTicks for Y-axis
        }

        public rotateLabels(chart: Chart, svg: D3.Selection): void {
            // TODO - Implement label rotation for Y-axis
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
}