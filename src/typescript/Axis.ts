/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Axis {
        public axis: D3.Svg.Axis;
        public hasTickmarks: boolean;
        public innerTicksize: number;
        public outerTicksize: number;
        public scale: any;
        public svgAxis: D3.Selection;
        public svgGrid: D3.Selection;
        public svgTitle: D3.Selection;
        public svgZeroLine: D3.Selection;
        public ticks: number;
        public title: string;
        public x: number;
        public y: number;

        protected _chart: Chart;
        protected _formatter: Function;
        protected _orient: OrientationType;

        private _gridlineType: GridLineType;
        private _scaleType: ScaleType;

        constructor(args: any, chart: Chart) {
            this.axis = null;
            this.hasTickmarks = true;
            this.innerTicksize = this.getInnerTicksize(chart);
            this.outerTicksize = this.getOuterTicksize(chart);
            this.scale = null;
            this.svgAxis = null;
            this.svgGrid = null;
            this.svgTitle = null;
            this.svgZeroLine = null;
            this.ticks = null;
            this.title = null;
            this.x = null;
            this.y = null;

            this._chart = chart;
            this._gridlineType = GridLineType.None;
            this._orient = null;
        }

        public getGridlineType(): GridLineType {
            return this._gridlineType;
        }

        public isOrdinalScale(): boolean {
            if (this._scaleType === ScaleType.Ordinal) {
                return true;
            }
            return false;
        }

        public isLinearScale(): boolean {
            if (this._scaleType === ScaleType.Linear) {
                return true;
            }
            return false;
        }

        public isTimeScale(): boolean {
            if (this._scaleType === ScaleType.Time) {
                return true;
            }
            return false;
        }

        public draw(chart: Chart): void {
            // initialize
            this.innerTicksize = this.getInnerTicksize(chart);
            this.outerTicksize = this.getOuterTicksize(chart);
            this.scale = this.getScale(chart);
            this.ticks = this.getTicks(chart);
            this.x = this.getXCoordinate(chart);
            this.y = this.getYCoordinate(chart);

            // create d3 axis
            this.axis = d3.svg.axis()
                .scale(this.scale)
                .orient(this._orient)
                .ticks(this.ticks);

            //TODO - Provide option to provide custom formatters
            //this.axis.tickFormat(this._formatter());

            // draw tick marks
            if (!this.hasTickmarks) {
                this.axis.tickSize(0);
                this.axis.tickPadding(12);
            }

            // draw axis
            this.svgAxis = chart.canvas.plotArea.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + this.x + "," + this.y + ")")
                .append("g")
                .attr("class", "ticks")
                .call(this.axis);

            this.drawGridlines(chart, this.axis);
            if (this.isDataAxis() && chart.series.getMinValue() < 0) {
                this.drawZeroLine(chart, this.svgAxis);
            }
            this.rotateLabels(chart, this.svgAxis);
            this.drawTitle(chart, this.svgAxis);
        }

        public drawGridlines(chart: Chart, axis: D3.Svg.Axis): void {
            this.svgGrid = this.svgAxis.append("g")
                .attr("class", "grid");

            switch (this.getGridlineType()) {
                case GridLineType.Major:
                    this.svgGrid.call(axis
                        .tickSize(this.innerTicksize, this.outerTicksize)
                        .tickFormat((d: any): string => { return ""; }) // return no label for the grid lines
                    );
                    break;
                case GridLineType.Minor:
                    // TODO - Minor gridlines
                    break;
                default:
                    // Do nothing
                    break;
            }
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            //TODO - Make position of title optional
            this.svgTitle = svg.append("text")
                .text(this.title)
                .attr("class", "title");
        }

        public drawZeroLine(chart: Chart, svg: D3.Selection): void {
            this.svgZeroLine = this.svgGrid.append("g")
                .attr("class", "zero-line")
                .append("line");
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

        public getTicks(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getXCoordinate(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public getYCoordinate(chart: Chart): any {
            // child classes are responsible for implementing this method
        }

        public isDataAxis(): any {
            // child classes are responsible for implementing this method
        }

        public rotateLabels(chart: Chart, svg: D3.Selection): void {
            // child classes are responsible for implementing this method
        }

        public setScaleType(value: ScaleType): void {
            this._scaleType = value;
        }

        protected setGridlineType(type: string): void {
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
    }

    export class XAxis extends Axis {

        private _textRotation: string;

        constructor(args: any, chart: Chart) {
            super(args, chart);

            this.hasTickmarks = chart.settings.getValue("xAxis.tickmarks").toUpperCase() == "YES" ? true : false;
            this.title = chart.settings.getValue("xAxis.title.text");
            this.setOrient(chart.settings.getValue("xAxis.orient", "bottom"));
            this.setGridlineType(chart.settings.getValue("xAxis.gridlines"));
            this._textRotation = chart.settings.getValue("xAxis.labels.rotate", "0");
            this._formatter = new Function(chart.settings.getValue("xAxis._formatter"));
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            super.drawTitle(chart, svg);
            var anchor = "end";
            var x = chart.canvas.plotArea.width;
            var y = this._orient == "bottom" ? 30 : -30; // TODO: title needs to be positioned under labels but depends on size of labels

            this.svgTitle
                .attr("text-anchor", anchor)
                .attr("transform", "translate(" + x + "," + y + ")");
        }

        public drawZeroLine(chart: Chart, svg: D3.Selection): void {
            super.drawZeroLine(chart, svg);
            this.svgZeroLine
                .attr("x1", this.scale(0))
                .attr("x2", this.scale(0))
                .attr("y1", 0)
                .attr("y2", this._orient == "bottom" ? -chart.canvas.plotArea.height : chart.canvas.plotArea.height);
        }

        public getInnerTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.height;
        }

        public getOuterTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.height;
        }

        public getScale(chart: Chart): any {
            if (this._chart instanceof frnk.UI.Charts.StackedPercentBarChart) {
                this.setScaleType(ScaleType.Linear);
                var lowerScale = chart.series.getMinValue() < 0 ? -1 : 0;

                // return scale
                return d3.scale.linear()
                    .domain([lowerScale, 1])
                    .range([0, chart.canvas.plotArea.width]);
            }
            else if (this._chart instanceof frnk.UI.Charts.LineChart || this._chart instanceof frnk.UI.Charts.ColumnChart) {
                if (chart.categories.format == "%s") {
                    this.setScaleType(ScaleType.Ordinal);
                    return d3.scale.ordinal()
                        .domain(chart.categories.getItems())
                        .rangeBands([0, chart.canvas.plotArea.width], chart.plotOptions.innerPadding, chart.plotOptions.outerPadding);
                }
                else {
                    this.setScaleType(ScaleType.Time);
                    return d3.time.scale()
                        .domain(d3.extent(chart.categories.getItems(), (d: any): Date => {
                            return d3.time.format(chart.categories.format).parse(d);
                        }))
                        .nice() // adds additional ticks to add some whitespace
                        .range([0, chart.canvas.plotArea.width]);
                }
            }
            else {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0, chart.series.getMaxValue()])
                    .nice() // adds additional ticks to add some whitespace
                    .range([0, chart.canvas.plotArea.width]);
            }
        }

        public getTicks(chart: Chart): number {
            return Number(chart.settings.getValue("xAxis.ticks", String(Math.max(chart.canvas.plotArea.width / 50, 2))));
        }

        public getXCoordinate(chart: Chart): number {
            return 0;
        }

        public getYCoordinate(chart: Chart): number {
            return this._orient == "bottom" ? chart.canvas.plotArea.height : 0;
        }

        public isDataAxis(): boolean {
            if (this._chart instanceof frnk.UI.Charts.LineChart || this._chart instanceof frnk.UI.Charts.ColumnChart) {
                return false;
            }
            return true;
        }

        public rotateLabels(chart: Chart, svg: D3.Selection): void {
            // rotate labels
            var textAnchorAttr = this._orient == "bottom" ? "end" : "begin";
            var translateAttr = this._orient == "bottom" ? "translate(-8 4)" : "translate(8 -4)";

            if (this._textRotation != "0") {
                svg.selectAll("text")
                    .style("text-anchor", textAnchorAttr)
                    .attr("transform", translateAttr + " rotate(" + this._textRotation + ")");
            }
        }

        public setOrient(value: OrientationType): void {
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
        constructor(args: any, chart: Chart) {
            super(args, chart);
            this.setOrient(chart.settings.getValue("yAxis.orient", "left"));
            this.hasTickmarks = chart.settings.getValue("yAxis.tickmarks").toUpperCase() == "YES" ? true : false;
            this.title = chart.settings.getValue("yAxis.title.text");
            this.setGridlineType(chart.settings.getValue("yAxis.gridlines"));
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            super.drawTitle(chart, svg);

            var anchor = this._orient == "left" ? "begin" : "end";
            var x = 0;
            var y = -30;

            this.svgTitle
                .attr("text-anchor", anchor)
                .attr("transform", "translate(" + x + "," + y + ")");
        }

        public drawZeroLine(chart: Chart, svg: D3.Selection): void {
            super.drawZeroLine(chart, svg);
            this.svgZeroLine
                .attr("x1", 0)
                .attr("x2", this._orient == "left" ? chart.canvas.plotArea.width : -chart.canvas.plotArea.width)
                .attr("y1", this.scale(0))
                .attr("y2", this.scale(0));
        }

        public getInnerTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.width;
        }

        public getOuterTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.width;
        }

        public getScale(chart: Chart): any {
            if (this._chart instanceof frnk.UI.Charts.StackedPercentColumnChart ||
                this._chart instanceof frnk.UI.Charts.StackedPercentLineChart) {
                this.setScaleType(ScaleType.Linear);
                var lowerScale = chart.series.getMinValue() < 0 ? -1 : 0;
                return d3.scale.linear()
                    .domain([1, lowerScale])
                    .range([0, chart.canvas.plotArea.height]);
            }
            else if (this._chart instanceof frnk.UI.Charts.BarChart) {
                if (chart.categories.format == "%s") {
                    this.setScaleType(ScaleType.Ordinal);
                    return d3.scale.ordinal()
                        .domain(chart.categories.getItems())
                        .rangeRoundBands([0, chart.canvas.plotArea.height], chart.plotOptions.innerPadding, chart.plotOptions.outerPadding);
                }
                else {
                    this.setScaleType(ScaleType.Time);
                    return d3.time.scale()
                        .domain(d3.extent(chart.categories.getItems(), (d: any): Date => {
                            return d3.time.format(chart.categories.format).parse(d);
                        }).reverse())
                        .nice() // adds additional ticks to add some whitespace
                        .range([chart.series.getMinValue(), chart.canvas.plotArea.height]);

                }
            }
            else {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([chart.series.getMaxValue(), chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0])
                    .nice() // adds additional ticks to add some whitespace
                    .range([0, chart.canvas.plotArea.height]);
            }
        }

        public getTicks(chart: Chart): number {
            return Number(chart.settings.getValue("yAxis.ticks", String(Math.max(chart.canvas.plotArea.height / 50, 2))));
        }

        public getXCoordinate(chart: Chart): number {
            return this._orient == "left" ? 0 : chart.canvas.plotArea.width;
        }

        public getYCoordinate(chart: Chart): number {
            return 0;
        }

        public isDataAxis(): boolean {
            if (this._chart instanceof frnk.UI.Charts.ColumnChart || this._chart instanceof frnk.UI.Charts.LineChart) {
                return true;
            }
            return false;
        }

        public rotateLabels(chart: Chart, svg: D3.Selection): void {

        }

        public setOrient(value: OrientationType): void {
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
}