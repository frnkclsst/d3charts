/// <reference path="./typings/d3/d3.d.ts" />
"use strict";

module frnk.UI.Charts {

    export class Settings {
        public settings: string;

        constructor(settings: any) {
            this.settings = settings;
        }

        public getValue(propStr: string, defaultValue?: string): any {
            var parts = propStr.split(".");
            var cur = this.settings;
            for (var i = 0; i < parts.length; i++) {
                if (!cur[parts[i]]) {
                    console.log(">> WARN: " + propStr + " not set in settings");
                    if (defaultValue) {
                        console.log(">> WARN: " + propStr + " defaulted to '" + defaultValue + "'");
                        return defaultValue;
                    }
                    return "";
                }
                cur = cur[parts[i]];
            }
            return cur;
        }
    }

    export class Canvas {
        public height: number;
        public legend: LegendArea;
        public plotArea: PlotArea;
        public svg: D3.Selection;
        public title: TitleArea;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;
            this.height = Number(chart.settings.getValue("canvas.height", "200"));
            this.width = Number(chart.settings.getValue("canvas.width", "200"));
            this.title = new TitleArea(chart);
            this.legend = new LegendArea(chart);
            this.plotArea = new PlotArea(chart);
        }

        public draw(): Canvas {
            // draw chart area
            this.svg = d3.select(this._chart.selector)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            return this;
        }

        public updateCanvasSize(): void {
            var container = d3.select(this._chart.selector);
            var width = Number(container.style("width").substring(0, container.style("width").length - 2));
            var height = Number(container.style("height").substring(0, container.style("height").length - 2));
            this.width = width == 0 ? this.width : width;
            this.height =  height == 0 ? this.height : height;
        }
    }

    export class Series {
        public labels: string[];
        public length: number;
        public matrix: any[];

        private _chart: Chart;
        private _items: Serie[];

        constructor(chart: Chart) {
            this._chart = chart;
            this._items = this._setSeries(chart.settings.getValue("series"));

            this.labels = this._setLabels();
            this.length = this._items.length;
            this.matrix = this._setStackedMatrix();
        }

        public getColor(i: number): string {
            return this._items[i].getColor(i);
        }

        public getName(i: number): string {
            return this._items[i].getName(i);
        }

        public getMatrixSum(): number[] {  //TODO: should be removed - needed for pie chart, but one pie chart per serie should be created
            var array: number[] = [];
            for (var i = 0; i < this._items.length; i++) {
                array.push(this._items[i].sum);
            }
            return array;
        }

        public getMaxValue(): number {
            if ((this._chart instanceof frnk.UI.Charts.StackedBarChart || this._chart instanceof frnk.UI.Charts.StackedLineChart) && this._items.length > 1) {
				// can only be stacked if you have more than 1 series defined
                return d3.max(this.matrix, function (array: number[]): number {
                    return d3.max(array, function (d: any): number {
                        return d.y0;
                    });
                });
            }
            else {
                return d3.max(this.matrix, function (array: number[]): number {
                    return d3.max(array, function (d: any): number {
                        return d.y;
                    });
                });
            }
        }

        public getMinValue(): number {
            if ((this._chart instanceof frnk.UI.Charts.StackedBarChart || this._chart instanceof frnk.UI.Charts.StackedLineChart) && this._items.length > 1) {
			// can only be stacked if you have more than 1 series defined
                return d3.min(this.matrix, function (array: number[]): number {
                    return d3.min(array, function (d: any): number {
                        return d.y0 + d.y;
                    });
                });
            }
            else {
                return d3.min(this.matrix, function (array: number[]): number {
                    return d3.min(array, function (d: any): number {
                        return d.y;
                    });
                });
            }
        }

        public getSerie(i: number): Serie {
            return this._items[i];
        }

        private _getMappedMatrix(): any[] {
            var matrix = [];
            for (var serie = 0; serie < this._items.length; serie++) {
                matrix.push(this._items[serie].getValues());
            }

            var mappedMatrix = matrix.map(function (data: any, i: number): any[] {
                var t = matrix[i];
                return t.map(function (d: any, j: number): any {
                    return { y: d, y0: 0, size: 0, perc: 0 };
                });
            });

            return mappedMatrix;
        }

        private _setStackedMatrix(): any[] {
            var matrix = this._getMappedMatrix();

            var transposedMatrix = this._transposeMatrix(matrix);

            transposedMatrix.forEach(function (m: any): any {
                var posBase = 0, negBase = 0, sum = 0;

                m.forEach(function (k: any): any {
                    sum = sum + k.y;
                });

                m.forEach(function (k: any): any {
                    k.perc = k.y / sum; // calculate percentage of this value across the different series
                    k.size = Math.abs(k.y);
                    if (k.y < 0) {
                        k.y0 = negBase;
                        negBase -= k.size;
                    }
                    else {
                        k.y0 = posBase = posBase + k.size;
                    }
                });
            });

            return this._transposeMatrix(transposedMatrix);
        }

        private _setLabels(): string[] {
            var names: string[] = [];
            for (var i = 0; i < this._items.length; i++) {
                names.push(this._items[i].getName(i));
            }
            return names;
        }

        private _setSeries(series: any): Serie[] {
            var array: Serie[] = [];
            for (var i = 0; i < series.length; i++) {
                array.push(new Serie(series[i]));
            }
            return array;
        }

        private _transposeMatrix(a: any): any {
            return Object.keys(a[0]).map(
                function (c: any): any { return a.map(function (r: any): any { return r[c]; }); }
                );
        }
    }

    export class Serie {
        public max: number;
        public min: number;
        public sum: number;

        private _color: string;
        private _fillColor: string;
        private _data: number[];
        private _name: string;

        constructor(serie: any) {
            this._color = serie.color;
            this._fillColor = serie.fillColor;
            this._data = serie.data;
            this._name = serie.name;

            this.max = d3.max(this._data);
            this.min = d3.min(this._data);
            this.sum = d3.sum(this._data);
        }

        public getColor(i?: number): string {
            //TODO - fallback in case bigger than 20 series
            if (this._color != null) {
                return this._color;
            }
            return ColorPalette.getColor(i);
        }

        public getFillColor(i?: number): string {
            //TODO - fallback in case bigger than 20 series
            if (this._fillColor != null) {
                return this._fillColor;
            }
            return ColorPalette.getFillColor(i);
        }

        public getName(i: number): string {
            if (this._name != null) {
                return this._name;
            }
            return "Serie " + (i + 1);
        }

        public getValues(): number[] {
            return this._data;
        }
    }

    export class TitleArea {
        public align: string;
        public height: number;
        public subTitle: string;
        public svg: any;
        public text: string;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.align = chart.settings.getValue("title.align", "center");
            this.height = Number(chart.settings.getValue("title.height", "50"));
            this.subTitle = chart.settings.getValue("title.subTitle");
            this.text = chart.settings.getValue("title.text");
        }

        public draw(): void {
            this.width = this._chart.canvas.width; //TODO - quick hack

            // get text
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "title")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("transfrom", "translate(0,0)");

            var svgTitle = this.svg.append("text")
                .text(this.text);

            // calculate alignment
            var textBox = this.svg.node().getBBox();
            var x;
            switch (this.align) {
                case "left":
                    x = 0;
                    break;
                case "center":
                    x = (this.width - textBox.width) / 2;
                    break;
                case "right":
                    x = this.width - textBox.width;
                    break;
            }

            var y = (this.height + textBox.height) / 2;

            // set title position
            svgTitle
                .attr("x", function (): number { return x; })
                .attr("y", function (): number { return y; });

            // draw line
            this.svg.append("line")
                .attr("class", "sep")
                .attr("x1", 0)
                .attr("y1", this.height)
                .attr("x2", this.width)
                .attr("y2", this.height);
        }
    }

    export class PlotArea {
        public height: number;
        public width: number;
        public svg: D3.Selection;
        public padding: number;

        constructor(chart: Chart) {
            this.height = 0; //chart.canvas.height - chart.canvas.title.height;
            this.padding = Number(chart.settings.getValue("canvas.padding", "20"));
            this.width = 0; //chart.canvas.width - chart.canvas.legend.width;
        }

        public draw(): void {

        }
    }

    export class LegendArea {
        public height: number;
        public position: string;
        public title: string;
        public svg: D3.Selection;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.height = Number(chart.settings.getValue("legend.height", "0"));
            this.position = chart.settings.getValue("legend.position", "right");
            this.title = chart.settings.getValue("legend.title");
            this.width = Number(chart.settings.getValue("legend.width", "0"));
        }

        public draw(): void {
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (this._chart.canvas.width - this.width) + "," + this._chart.canvas.title.height + ")");

            // draw line
            this.svg.append("line")
                .attr("class", "sep")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", this._chart.canvas.height - this._chart.canvas.title.height);

            // add items
            var items = this.svg
                .selectAll(".item")
                .data(this._chart.series.matrix)
                .enter().append("g")
                .attr("class", "item")
                .attr("transform", (d: any, i: any): string => { return "translate(" + 30 + "," + ((i * 20) + 20) + ")"; });

            if (this._chart instanceof frnk.UI.Charts.LineChart) {
                items.append("line")
                    .attr("x1", 0)
                    .attr("x2", 24)
                    .attr("y1", 6)
                    .attr("y2", 6)
                    .style("stroke", (d: any, i: any): string => { return this._chart.series.getColor(i); })
                    .style("stroke-width", "2");

                items.append("circle")
                    .attr("cx", 12)
                    .attr("cy", 6)
                    .attr("r", 4)
                    .style("fill", "#fff")
                    .style("stroke", (d: any, i: any): string => { return this._chart.series.getColor(i); })
                    .style("stroke-width", "2");
            }
            else {
                items.append("rect")
                    .attr("x", 0)
                    .attr("width", 24)
                    .attr("height", 11)
                    .style("fill", (d: any, i: any): string => { return this._chart.series.getColor(i); });
            }

            items.append("text")
                .attr("x", 30)
                .attr("y", 9)
                .attr("dy", "0px")
                .style("text-anchor", "begin")
                .text((d: any, i: any): string => {
                    return this._chart.series.getName(i);
                });
        }
    }

    // TODO - Refactor
    export class PlotOptions {
        public innerPadding: number;
        public outerPadding: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.innerPadding = Number(chart.settings.getValue("plotOptions.general.innerPadding", "0.5"));
            this.outerPadding = Number(chart.settings.getValue("plotOptions.general.outerPadding", "0"));
        }
    }

    export class Axis {
        public categories: string[];
        public format: string;
        public position: string;
        public scale: any;
        public ticks: number;
        public title: string;

        private _gridlineType: GridLineType;
        private _scaleType: ScaleType;

        constructor(args: any, chart: Chart) {
            this.categories = null;
            this.position = null;
            this.scale = null;
            this.ticks = null;
            this.title = null;
            this._gridlineType = GridLineType.None;
        }

        public setScaleType(value: ScaleType): void {
            this._scaleType = value;
        }

        public getGridlineType(): GridLineType {
            return this._gridlineType;
        }

        public isDataAxis(): boolean {
            if (typeof (this.categories) != "undefined") {
                return false;
            }
            return true;
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

        public parseCategory(value: string): any { //TODO: add return type
            if (this.format == "%s") {
                return value;
            }
            else if (this.format == "%n") {
                return value;
            }
            else {
                return d3.time.format(this.format).parse(value);
            }
        }

        public draw(chart: Chart): void {
            // child classes are responsible for implementing this method
        }

        public drawGridlines(chart: Chart, axis: D3.Svg.Axis, offset: number): void {
            // child classes are responsible for implementing this method
        }

        protected _setGridlineType(type: string): void {
            if (type.toUpperCase() == "MAJOR") {
                this._gridlineType = GridLineType.Major;
            }
            else if (type.toUpperCase() == "MINOR") {
                this._gridlineType = GridLineType.Minor;
            }
            else {
                this._gridlineType = GridLineType.None;
            }
        }
    }

    export class XAxis extends Axis {

        private _textRotation: string;

        constructor(args: any, chart: Chart) {
            super(args, chart);
            this.categories = chart.settings.getValue("xAxis.categories");
            this.position = chart.settings.getValue("xAxis.position", "bottom");
            this.format = chart.settings.getValue("xAxis.format");
            this.ticks = Number(chart.settings.getValue("xAxis.ticks", String(Math.max(chart.canvas.width / 50, 2))));
            this.title = chart.settings.getValue("xAxis.title.text");
            this._textRotation = chart.settings.getValue("xAxis.labels.rotate", "0");
            this._setGridlineType(chart.settings.getValue("xAxis.gridlines"));
        }

        public draw(chart: Chart): Canvas {
            super.draw(chart);

            // set scale
            this.scale = this._setScale(chart);

            // create d3 axis
            var d3Axis = d3.svg.axis()
                .scale(this.scale)
                .orient(this.position)
                .ticks(this.ticks);

            // get offset to determine position
            var offset = this.getOffset(chart);

            // draw x-axis
            var svgAxis = chart.canvas.svg.append("g")
                .attr("class", "axis x-axis")
                .attr("transform", "translate(" + chart.canvas.plotArea.padding + "," + offset + ")")
                .call(d3Axis);

            this.drawLabels(chart, svgAxis);
            this.drawTitle(chart, svgAxis);
            this.drawGridlines(chart, d3Axis, offset);

            return chart.canvas;
        }

        public drawGridlines(chart: Chart, axis: D3.Svg.Axis, offset: number): Canvas {
            // draw grid
            var svgGrid = chart.canvas.svg.append("g")
                .attr("class", "x-axis grid")
                .attr("transform", "translate(" + chart.canvas.plotArea.padding + "," + offset + ")");

            // draw gridlines
            switch (this.getGridlineType()) {
                case GridLineType.Major:
                    svgGrid.call(axis
                        .tickSize(-chart.canvas.height + chart.canvas.title.height + chart.canvas.plotArea.padding * 2, 0)
                        .tickFormat((d: any): string => { return ""; }) // return no label for the grid lines
                    );
                    break;
                case GridLineType.Minor:
                    // TODO
                    break;
                default:
                    // Do nothing
                    break;
            }

            // draw zero line
            if (this.isDataAxis() && chart.series.getMinValue() < 0) {
                svgGrid.append("g")
                    .attr("class", "zero-line")
                    .append("line")
                    .attr("x1", this.scale(0))
                    .attr("x2", this.scale(0))
                    .attr("y1", 0)
                    .attr("y2", this.position == "bottom" ? -chart.canvas.height : chart.canvas.height);
            }

            return chart.canvas;
        }

        public drawLabels(chart: Chart, svg: D3.Selection): Canvas {
            // rotate labels
            var textAnchorAttr = this.position == "bottom" ? "end" : "begin";
            var translateAttr = this.position == "bottom" ? "translate(-8 2)" : "translate(12 -10)";

            if (this._textRotation != "0") {
                svg.selectAll("text")
                    .style("text-anchor", textAnchorAttr)
                    .attr("transform", translateAttr + " rotate(" + this._textRotation + ")");
            }

            return chart.canvas;
        }

        public drawTitle(chart: Chart, svg: D3.Selection): Canvas {
            var y = this.position == "bottom" ? 30 : -30; // TODO: title needs to be positioned under labels but depends on size of labels

            // draw title
            svg.append("text")
                .text(this.title)
                .attr("text-anchor", "end")
                .attr("transform", "translate(" + (chart.canvas.width - chart.canvas.plotArea.padding * 2 - chart.canvas.legend.width) + "," + y + ")");

            return chart.canvas;
        }

        public getOffset(chart: Chart): number {
            if (this.position == "bottom") {
                return chart.canvas.height - chart.canvas.plotArea.padding;
            }
            else {
                return chart.canvas.plotArea.padding + chart.canvas.title.height;
            }
        }

        private _setScale(chart: Chart): any {
            var plotAreaWidth = chart.canvas.width - chart.canvas.plotArea.padding * 2 - chart.canvas.legend.width;
            if (this.format == "%s") {
                this.setScaleType(ScaleType.Ordinal);
                return d3.scale.ordinal()
                    .domain(this.categories)
                    .rangeBands([0, plotAreaWidth], chart.plotOptions.innerPadding, chart.plotOptions.outerPadding);
            }
            else if (this.format == "%n") {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0, chart.series.getMaxValue()])
                    .nice() // adds additional ticks to add some whitespace  
                    .range([0, plotAreaWidth]);
            }
            else {
                this.setScaleType(ScaleType.Time);
                return d3.time.scale()
                    .domain(d3.extent(this.categories, (d: any): Date => { return d3.time.format(this.format).parse(d); }))
                    .nice() // adds additional ticks to add some whitespace  
                    .range([0, plotAreaWidth]);
            }
        }
    }

    export class YAxis extends Axis {

        constructor(args: any, chart: Chart) {
            super(args, chart);
            this.categories = args.yAxis.categories;
            this.format = chart.settings.getValue("yAxis.format");
            this.position = chart.settings.getValue("yAxis.position", "left");
            this.ticks = Number(chart.settings.getValue("yAxis.ticks", String(Math.max(chart.canvas.height / 50, 2))));
            this.title = chart.settings.getValue("yAxis.title.text");
            this._setGridlineType(chart.settings.getValue("yAxis.gridlines"));
        }

        public draw(chart: Chart): Canvas {
            super.draw(chart);

            // set scale
            this.scale = this._setScale(chart);

            // create d3 axis 
            var d3Axis = d3.svg.axis()
                .scale(this.scale)
                .orient(this.position)
                .ticks(this.ticks);

            // get offset to determine position
            var offset = this.getOffset(chart);

            // draw y-axis
            var svgAxis = chart.canvas.svg.append("g")
                .attr("class", "axis y-axis")
                .attr("transform", "translate(" + offset + "," + (chart.canvas.plotArea.padding + chart.canvas.title.height) + ")")
                .call(d3Axis);

            // draw title
            this.drawTitle(chart, svgAxis);

            // draw gridlines
            this.drawGridlines(chart, d3Axis, offset);

            return chart.canvas;
        }

        public drawGridlines(chart: Chart, axis: D3.Svg.Axis, offset: number): Canvas {
            //draw grid
            var svgGrid = chart.canvas.svg.append("g")
                .attr("class", "y-axis grid")
                .attr("transform", "translate(" + offset + "," + (chart.canvas.plotArea.padding + chart.canvas.title.height) + ")");

            // draw gridlines
            switch (this.getGridlineType()) {
                case GridLineType.Major:
                    svgGrid.call(axis
                        .tickSize(-chart.canvas.width + chart.canvas.legend.width + chart.canvas.plotArea.padding * 2, 0)
                        .tickFormat((): string => { return ""; }) // return no label for the grid lines
                    );
                    break;
                case GridLineType.Minor:
                    //TODO
                    break;
                default:
                    break;
            }

            // draw zero line
            if (this.isDataAxis() && chart.series.getMinValue() < 0) {
                var x2;
                if (this.position == "left") {
                    x2 = chart.canvas.width - chart.canvas.plotArea.padding * 2 - chart.canvas.legend.width;
                }
                else {
                    x2 = -chart.canvas.width + chart.canvas.plotArea.padding * 2 + chart.canvas.legend.width;
                }

                svgGrid.append("g")
                    .attr("class", "zero-line")
                    .append("line")
                    .attr("x1", 0)
                    .attr("x2", x2)
                    .attr("y1", this.scale(0))
                    .attr("y2", this.scale(0));
            }

            return chart.canvas;
        }

        public drawTitle(chart: Chart, svg: D3.Selection): Canvas {
            var textAnchor = this.position == "left" ? "begin" : "end";
            var x = this.position == "left" ? -20 : 20;

            svg.append("text")
                .text(this.title)
                .attr("text-anchor", textAnchor)
                .attr("x", x)
                .attr("y", -30);

            return chart.canvas;
        }

        public getOffset(chart: Chart): number {
            if (this.position == "left") {
                return chart.canvas.plotArea.padding;
            }
            else {
                return chart.canvas.width - chart.canvas.legend.width - chart.canvas.plotArea.padding;
            }
        }

        private _setScale(chart: Chart): any {
            var plotAreaHeight = chart.canvas.height - chart.canvas.title.height - chart.canvas.plotArea.padding * 2;
            if (this.format == "%s") {
                this.setScaleType(ScaleType.Ordinal);
                return d3.scale.ordinal()
                    .domain(this.categories)
                    .rangeRoundBands([0, plotAreaHeight], chart.plotOptions.innerPadding, chart.plotOptions.outerPadding);
            }
            else if (this.format == "%n") {
                this.setScaleType(ScaleType.Linear);
                return d3.scale.linear()
                    .domain([chart.series.getMaxValue(), chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0])
                    .nice() // adds additional ticks to add some whitespace 
                    .range([0, plotAreaHeight]);
            }
            else {
                this.setScaleType(ScaleType.Time);
                return d3.time.scale()
                    .domain(d3.extent(this.categories, (d: any): Date => { return d3.time.format(this.format).parse(d); }).reverse())
                    .nice() // adds additional ticks to add some whitespace  
                    .range([chart.series.getMinValue(), plotAreaHeight]);
            }
        }
    }

    export class Chart {
        public canvas: Canvas;
        public categories: string[];
        public plotOptions: PlotOptions;
        public series: Series;
        public settings: Settings;
        public selector: string;

        constructor(args: any, selector: string) {
            this.selector = selector;

            // Selector cannot be found
            try {
                if (d3.select(this.selector).empty()) {
                    throw Error(">> ERR: Selector '" + this.selector + "' not available");
                }
            }
            catch (e) {
                console.log(e.message);
            }

            this.settings = new Settings(args);

            this.canvas = new Canvas(this);
            this.plotOptions = new PlotOptions(this);
            this.series = new Series(this);

            // update size and add EventListener
            this.canvas.updateCanvasSize();
            d3.select(window).on("resize", (): void => {
                d3.select(this.selector).selectAll("*").remove();
                this.draw();
            });
        }

        public draw(): Canvas {
            this.canvas.updateCanvasSize();

            // draw canvas
            this.canvas.draw();

            // title
            this.canvas.title.draw();

            // draw legend
            this.canvas.legend.draw();

            return this.canvas;
        }
    }

    export class XYChart extends Chart {
        public xAxis: XAxis;
        public yAxis: YAxis;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.xAxis = new XAxis(args, this);
            this.yAxis = new YAxis(args, this);
        }

        public draw(): Canvas {
            super.draw();

            this.xAxis.draw(this);
            this.yAxis.draw(this);

            return this.canvas;
        }
    }

    export class LineChart extends XYChart {
        public showMarkers: boolean;
        public interpolation: string;
        public fillArea: boolean;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.showMarkers = this.settings.getValue("linechart.showMarkers") == "yes" ? true : false;
            this.interpolation = this.settings.getValue("linechart.interpolation", "linear");
            this.fillArea = this.settings.getValue("linechart.fillArea") == "yes" ? true : false;
        }

        public draw(): Canvas {
            super.draw();

            // draw chart
            var svgAreas = this.canvas.svg.append("g")
                .attr("class", "areas");

            var svgSeries = this.canvas.svg.append("g")
                .attr("class", "series");

            // draw areas
            // areas need to be drawn first, because the line and markers need to be drawn on top of it
            if (this.fillArea) {
                for (var i = 0; i < this.series.length; i++) {
                    var svgArea = svgAreas.append("g")
                        .attr("id", "area-" + i);

                    this.drawArea(svgArea, i);
                }
            }

            // draw lines
            for (var j = 0; j < this.series.length; j++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + j);

                // draw line
                this.drawLine(svgSerie, j);

                // draw markers
                if (this.showMarkers) {
                    var svgMarkers = this.drawMarkers(svgSerie, j);

                    // draw tooltip
                    this.drawTooltip(svgMarkers, j);
                }
            }

            return this.canvas;
        }

        public drawArea(svg: D3.Selection, serie: number): D3.Selection {
            var d3Area: D3.Svg.Area;

            if (this.xAxis.isDataAxis()) {
                d3Area = d3.svg.area()
                    .interpolate(this.interpolation)
                    .x(this.getXCoordinate(serie))
                    .x0(this.xAxis.scale(0) + this.canvas.plotArea.padding)
                    .y(this.getYCoordinate(serie));
            }
            else {
                d3Area = d3.svg.area()
                    .interpolate(this.interpolation)
                    .x(this.getXCoordinate(serie))
                    .y0(this.yAxis.scale(0) + this.canvas.plotArea.padding + this.canvas.title.height )
                    .y1(this.getYCoordinate(serie));
            }

            var svgArea = svg.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.series.matrix[serie]))
                .style("fill", this.series.getColor(serie))
                .style("opacity", "0.2");

            return svgArea;
        }

        public drawLine(svg: D3.Selection, serie: number): D3.Selection {
            var d3Line = d3.svg.line()
                .interpolate(this.interpolation)
                .x(this.getXCoordinate(serie))
                .y(this.getYCoordinate(serie));

            var svgLine = svg.append("path")
                .attr("class", "line")
                .attr("d", d3Line(this.series.matrix[serie]))
                .attr("stroke", this.series.getColor(serie))
                .attr("stroke-width", 1)
                .attr("fill", "none");

            return svgLine;
        }

        public drawMarkers(svg: D3.Selection, serie: number): D3.Selection {
            var svgMarkers = svg.selectAll(".marker")
                .data(this.series.matrix[serie])
                .enter().append("circle")
                .attr("class", "marker")
                .attr("stroke", this.series.getColor(serie))
                .attr("stroke-width", "0")
                .attr("fill", this.series.getColor(serie))
                .attr("cx", this.getXCoordinate(serie))
                .attr("cy", this.getYCoordinate(serie))
                .attr("r", 4);

            return svgMarkers;
        }

        public drawTooltip(svg: D3.Selection, serie: number): void {
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.on("mouseover", function (d: any): void {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Value " + "<br/>"  + d.y)
                    .style("left", (d3.mouse(this)[0]) + "px")
                    .style("top", (d3.mouse(this)[1] + 75) + "px");
                })
                .on("mouseout", function(d: any): void {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }

        public getXCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    return this.canvas.plotArea.padding + this.xAxis.scale(d.y);
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    if (this.xAxis.isOrdinalScale()) {
                        return this.canvas.plotArea.padding + this.xAxis.scale(this.xAxis.parseCategory(this.xAxis.categories[i])) + this.xAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return this.canvas.plotArea.padding + this.xAxis.scale(this.xAxis.parseCategory(this.xAxis.categories[i]));
                    }
                };
            }
        }

        public getYCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    var axisScale = this.yAxis.parseCategory(this.yAxis.categories[i]);
                    if (this.yAxis.isOrdinalScale()) {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(axisScale) + this.yAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(axisScale);
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(d.y);
                };
            }
        }
    }

    export class StackedLineChart extends LineChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        public drawArea(svg: D3.Selection, serie: number): D3.Selection {
            var d3Area: D3.Svg.Area;

            if (this.xAxis.isDataAxis()) {
                d3Area = d3.svg.area()
                    .interpolate(this.interpolation)
                    .x(this.getXCoordinate(serie))
                    .x0(
                    (d: any): number => {
                        // negative values
                        if (d.y < 0) {
                            return (this.xAxis.scale(d.y0) + this.canvas.plotArea.padding);
                        }
                        // positive values
                        else {
                            return (this.xAxis.scale(d.y0 - d.y) + this.canvas.plotArea.padding);
                        }
                    })
                    .y(this.getYCoordinate(serie));
            }
            else {
                d3Area = d3.svg.area()
                    .interpolate(this.interpolation)
                    .x(this.getXCoordinate(serie))
                    .y0(
                    (d: any): number => {
                        // negative values
                        if (d.y < 0) {
                            return (this.yAxis.scale(d.y0) + this.canvas.title.height + this.canvas.plotArea.padding);
                        }
                        // postive values
                        else {
                            return (this.yAxis.scale(d.y0 - d.y) + this.canvas.title.height + this.canvas.plotArea.padding);
                        }
                    })
                    .y1(this.getYCoordinate(serie));
            }

            var svgArea = svg.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.series.matrix[serie]))
                .style("fill", this.series.getColor(serie))
                .style("opacity", "0.2");

            return svgArea;
        }

        public drawTooltip(svg: D3.Selection): D3.Selection {
            return svg.append("title")
                .text(function (d: any): number {
                if (d.y < 0) {
                    return d.y + d.y0;
                }
                else {
                    return d.y0;
                }
            });
        }

        public getXCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    // negative numbers                                        
                    if (d.y0 < 1) {
                        return this.canvas.plotArea.padding + this.xAxis.scale(d.y0 + d.y);
                    }
                    // positive numbers
                    else {
                        return this.canvas.plotArea.padding + this.xAxis.scale(d.y0);
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    if (this.xAxis.isOrdinalScale() || this.xAxis.isLinearScale()) {
                        return this.canvas.plotArea.padding + this.xAxis.scale(this.xAxis.parseCategory(this.xAxis.categories[i])) + this.xAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return this.canvas.plotArea.padding + this.xAxis.scale(this.xAxis.parseCategory(this.xAxis.categories[i])); // for time scales
                    }
                };
            }
        }

        public getYCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    var axisScale = this.yAxis.parseCategory(this.yAxis.categories[i]);
                    if (this.yAxis.isOrdinalScale() || this.yAxis.isLinearScale()) {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(axisScale) + this.yAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(axisScale); // for time scales
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    // negative numbers                                        
                    if (d.y0 < 1) { //TODO -  I think this only works for whole numbers
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(d.y0 + d.y);
                    }
                    // positive numbers
                    else {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(d.y0);
                    }
                };
            }
        }
    }

    export class BarChart extends XYChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        public draw(): Canvas {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.svg.append("g")
                .attr("class", "series");

            // draw bars
            for (var j = 0; j < this.series.length; j++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + j)
                    .selectAll("rect")
                    .data(this.series.matrix[j])
                    .enter();

                // draw bar
                var svgBar = svgSerie.append("rect")
                    .attr({
                    "x": this.getXCoordinate(j),
                    "y": this.getYCoordinate(j),
                    "class": "bar",
                    "width": this.getWidth(j),
                    "height": this.getHeight(j),
                    "fill": this.series.getColor(j)
                });

                // draw tooltip
                svgBar.append("title")
                    .text((d: any): number => { return d.y; });

                // draw labels
                /*
                var svgLabels = svgSerie.append("text")
                    .attr("x", this.getXCoordinate(j))
                    .attr("y", this.getYCoordinate(j))
                    .attr("fill", "#878787")
                    .attr("dy", "-.5em")
                    .text(function (d: any) { return parseFloat(d.y).toFixed(2); });
                */
            }

            return this.canvas;
        }

        public getXCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    if (d.y < 0) {
                        return this.canvas.plotArea.padding + this.xAxis.scale(0) - Math.abs(this.xAxis.scale(d.size) - this.xAxis.scale(0));
                    }
                    else {
                        return this.canvas.plotArea.padding + this.xAxis.scale(0);
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    var axisScale = this.xAxis.parseCategory(this.xAxis.categories[i]);
                    if (this.xAxis.isOrdinalScale()) {
                        return this.canvas.plotArea.padding + this.xAxis.scale(axisScale) + (this.xAxis.scale.rangeBand() / this.series.length * serie);
                    }
                    else {
                        return this.canvas.plotArea.padding + this.xAxis.scale(axisScale) + (this.canvas.width / this.series.length / this.series.matrix[0].length * serie);
                    }
                };
            }
        }

        public getYCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    var axisScale = this.yAxis.parseCategory(this.yAxis.categories[i]);
                    var totalHeight = this.canvas.plotArea.padding + this.canvas.title.height;
                    var series = this.series;
                    if (this.yAxis.isOrdinalScale()) {
                        return totalHeight + this.yAxis.scale(axisScale) + (this.yAxis.scale.rangeBand() / series.length * serie);
                    }
                    else {
                        return totalHeight + this.yAxis.scale(axisScale) + (this.canvas.width / series.length / series.matrix[0].length / series.length * serie);
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    if (d.y < 0) {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(d.y) - Math.abs(this.yAxis.scale(d.size) - this.yAxis.scale(0));
                    }
                    else {
                        return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(d.y);
                    }
                };
            }
        }

        public getHeight(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    if (this.yAxis.isOrdinalScale()) {
                        return Math.abs(this.yAxis.scale.rangeBand() / this.series.length);
                    }
                    else {
                        return Math.abs(this.canvas.width / this.series.length / this.series.matrix[0].length / this.series.length);
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return function (d: any, i: number): any {
                    return Math.abs(this.yAxis.scale(d.y) - this.yAxis.scale(0));
                };
            }
        }

        public getWidth(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    return Math.abs(this.xAxis.scale(d.y) - this.xAxis.scale(0));
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): number => {
                    if (this.xAxis.isOrdinalScale()) {
                        return this.xAxis.scale.rangeBand() / this.series.length;
                    }
                    else {
                        return this.canvas.width / this.series.length / this.series.matrix[0].length;
                    }
                };
            }
        }
    }

    export class StackedBarChart extends BarChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        public draw(): Canvas {
            super.draw();

            return this.canvas;
        }

        public getXCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    return this.canvas.plotArea.padding + this.xAxis.scale(0) - (this.xAxis.scale(d.size) - this.xAxis.scale(d.y0));
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    return this.canvas.plotArea.padding + this.xAxis.scale(this.xAxis.parseCategory(this.xAxis.categories[i]));
                };
            }
        }

        public getYCoordinate(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(this.yAxis.parseCategory(this.yAxis.categories[i]));
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    return this.canvas.plotArea.padding + this.canvas.title.height + this.yAxis.scale(d.y0);
                };
            }
        }

        public getHeight(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    if (this.yAxis.isOrdinalScale() || this.yAxis.isLinearScale()) {
                        return this.yAxis.scale.rangeBand();
                    }
                    else {
                        return this.canvas.height / this.series.length / this.series.matrix[0].length;
                    }
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    return Math.abs(this.yAxis.scale(0) - this.yAxis.scale(d.size));
                };
            }
        }

        public getWidth(serie: number): any {
            if (this.xAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    return Math.abs(this.xAxis.scale(0) - this.xAxis.scale(d.y));
                };
            }

            if (this.yAxis.isDataAxis()) {
                return (d: any, i: number): any => {
                    if (this.xAxis.isOrdinalScale() || this.xAxis.isLinearScale()) {
                        return this.xAxis.scale.rangeBand();
                    }
                    else {
                        return this.canvas.width / this.series.length / this.series.matrix[0].length; //did it to support time scales
                    }
                };
            }
        }
    }

    export class PieChart extends Chart {
        public innerRadius: number;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.innerRadius = Number(this.settings.getValue("piechart.innerRadius", "0.9"));
        }

        public draw(): Canvas {
            super.draw();

            var plotAreaWidth = this.canvas.width - this.canvas.plotArea.padding * 2 - this.canvas.legend.width;
            var plotAreaHeight = this.canvas.height - this.canvas.title.height;

            var radius = Math.min(plotAreaWidth / 2 - this.canvas.plotArea.padding * 2, plotAreaHeight / 2 - this.canvas.plotArea.padding);

            var serieRadius =  radius / this.series.length;
            for (var s = 0; s < this.series.length; s++) {
                var g = this.canvas.svg.append("g")
                    .attr("transform", "translate(" + (plotAreaWidth / 2 + this.canvas.plotArea.padding) + "," + (plotAreaHeight / 2 + this.canvas.title.height) + ")");

                var innerRadius = (serieRadius * (s + 1)) - (serieRadius * this.innerRadius);

                var arc = d3.svg.arc()
                    .outerRadius(serieRadius * (s + 1))
                    .innerRadius(innerRadius); // inner radius = 0 => pie chart

                var pie = d3.layout.pie();

                var arcs = g.selectAll("g.slice")
                    .data(pie(this.series.getSerie(s).getValues()))
                    .enter()
                    .append("g")
                    .attr("class", "slice");

                arcs.append("path")
                    .attr("fill", (d: any, i: number): string => { return this.series.getSerie(s).getColor(i); })
                    .attr("d", arc);

                // draw tooltip
                arcs.append("title")
                    .text(function (d: any): number {
                        return d.value;
                    });
            }
            return this.canvas;
        }
    }

    export class BubbleChart extends Chart {
        //TODO
    }

    export enum GridLineType {
        None,
        Major,
        Minor
    }

    export enum StackType {
        None,
        Normal,
        Percent
    }

    export enum ScaleType {
        Linear,
        Ordinal,
        Time
    }
}

module frnk.UI.Charts.ColorPalette {

    export function getColor(i: number): string {
        var _colors =
            [
                "#5491F6",
                "#7AC124",
                "#FFA300",
                "#129793",
                "#F16A73",
                "#1B487F",
                "#FF6409",
                "#CC0000",
                "#8E44AD",
                "#936A4A",
                "#2C5195",
                "#4B7717",
                "#D58A02",
                "#005D5D",
                "#BD535B",
                "#123463",
                "#980101",
                "#D85402",
                "#622E79",
                "#60452F"
            ];
        return _colors[i];
    }

    export function getFillColor(i: number): string {
        var _fillColors =
            [
                "#C9DCFE",
                "#D6EEAF",
                "#FFE4AF",
                "#B6E0DE",
                "#FCD2D4",
                "#BAC8D9",
                "#FFD0B0",
                "#F1B2B1",
                "#DDC6E7",
                "#DED2C7",
                "#BFCAE0",
                "#C9D7B8",
                "#F3DDB1",
                "#B1CECE",
                "#ECCBCD",
                "#B7C2D1",
                "#E1B2B1",
                "#F4CBB1",
                "#D0BFD8",
                "#CFC7C0"
            ];
        return _fillColors[i];
    }
}