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

        protected chart: Chart;
        protected formatter: string;
        protected orient: OrientationType;
        protected textRotation: string;

        private _gridlineType: GridLineType;
        private _scaleType: ScaleType;

        constructor(args: any, chart: Chart) {
            this.axis = null;
            this.formatter = null;
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

            this.chart = chart;
            this.orient = null;
            this._gridlineType = GridLineType.None;
        }

        public getGridlineType(): GridLineType {
            return this._gridlineType;
        }

        public getScaleType(): ScaleType {
            return this._scaleType;
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
                .orient(this.orient)
                .ticks(this.ticks);

            // apply custom formatter
            if (this.formatter != null) {
                this.axis.tickFormat(d3.format(this.formatter));
            }

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

        constructor(args: any, chart: Chart) {
            super(args, chart);

            this.hasTickmarks = chart.settings.getValue("xAxis.tickmarks").toUpperCase() == "YES" ? true : false;
            this.title = chart.settings.getValue("xAxis.title.text");
            this.setOrientation(chart.settings.getValue("xAxis.orient", "bottom"));
            this.setGridlineType(chart.settings.getValue("xAxis.gridlines"));
            this.textRotation = chart.settings.getValue("xAxis.labels.rotate", "0");
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            super.drawTitle(chart, svg);
            var anchor = "end";
            var x = chart.canvas.plotArea.width;
            var y = this.orient == "bottom" ? 30 : -30; // TODO: title needs to be positioned under labels but depends on size of labels

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
                .attr("y2", this.orient == "bottom" ? -chart.canvas.plotArea.height : chart.canvas.plotArea.height);
        }

        public getInnerTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.height;
        }

        public getOuterTicksize(chart: Chart): number {
            return -chart.canvas.plotArea.height;
        }

        public getScale(chart: Chart): any {
            if (chart instanceof StackedPercentBarChart) {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([chart.series.getMinValue() < 0 ? -1 : 0, 1])
                    .range([0, chart.canvas.plotArea.width]);
            }
            else if (chart instanceof BarChart) {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0, chart.series.getMaxValue()])
                    .nice() // adds additional ticks to add some whitespace
                    .range([0, chart.canvas.plotArea.width]);
            }
            else {
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
        }

        public getTicks(chart: Chart): number {
            return Number(chart.settings.getValue("xAxis.ticks", String(Math.max(chart.canvas.plotArea.width / 50, 2))));
        }

        public getXCoordinate(chart: Chart): number {
            return 0;
        }

        public getYCoordinate(chart: Chart): number {
            return this.orient == "bottom" ? chart.canvas.plotArea.height : 0;
        }

        public isDataAxis(): boolean {
            if (this.chart instanceof LineChart || this.chart instanceof ColumnChart) {
                return false;
            }
            return true;
        }

        public rotateLabels(chart: Chart, svg: D3.Selection): void {
            // rotate labels
            var textAnchorAttr = this.orient == "bottom" ? "end" : "begin";
            var translateAttr = this.orient == "bottom" ? "translate(-8 4)" : "translate(8 -4)";

            if (this.textRotation != "0") {
                svg.selectAll("text")
                    .style("text-anchor", textAnchorAttr)
                    .attr("transform", translateAttr + " rotate(" + this.textRotation + ")");
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
        constructor(args: any, chart: Chart) {
            super(args, chart);
            this.hasTickmarks = chart.settings.getValue("yAxis.tickmarks").toUpperCase() == "YES" ? true : false;
            this.title = chart.settings.getValue("yAxis.title.text");
            this.setGridlineType(chart.settings.getValue("yAxis.gridlines"));
            this.setOrientation(chart.settings.getValue("yAxis.orient", "left"));
            this.textRotation = chart.settings.getValue("yAxis.labels.rotate", "0");
        }

        public drawTitle(chart: Chart, svg: D3.Selection): void {
            super.drawTitle(chart, svg);

            var anchor = this.orient == "left" ? "begin" : "end";
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
                .attr("x2", this.orient == "left" ? chart.canvas.plotArea.width : -chart.canvas.plotArea.width)
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
            if (this.chart instanceof StackedPercentColumnChart ||
                this.chart instanceof StackedPercentLineChart) {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([1, chart.series.getMinValue() < 0 ? -1 : 0])
                    .range([0, chart.canvas.plotArea.height]);
            }
            else if (this.chart instanceof BarChart) {
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
            return this.orient == "left" ? 0 : chart.canvas.plotArea.width;
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

        public rotateLabels(chart: Chart, svg: D3.Selection): void {

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