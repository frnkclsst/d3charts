/// <reference path="lib/typings/d3/d3.d.ts" />
"use strict";

module FRNK.UI.Charts {

    export class Settings {
        settings: string;

        constructor(settings: any) {
            this.settings = settings;
        }

        getValue(propStr: string): any {
            var parts = propStr.split(".");
            var cur = this.settings;
            for (var i = 0; i < parts.length; i++) {
                if (!cur[parts[i]])
                    return null;
                cur = cur[parts[i]];
            }
            return cur;
        }

        isSet(propStr: string) : boolean {
            var parts = propStr.split(".");
            var cur = this.settings;
            for (var i = 0; i < parts.length; i++) {
                if (!cur[parts[i]])
                    return false;
                cur = cur[parts[i]];
            }
            return true;
        }
    }

    export class Canvas {
        private _chart: Chart;

        height: number
        padding: number
        svg: D3.Selection;
        width: number

        constructor(chart: Chart) {
            this._chart = chart;
            this.height = chart.settings.isSet("canvas.height") ? chart.settings.getValue("canvas.height") : 300;
            this.padding = chart.settings.isSet("canvas.padding") ? chart.settings.getValue("canvas.padding") : 30; // TODO: replace with margins 
            this.width = chart.settings.isSet("canvas.width") ? chart.settings.getValue("canvas.width") : 300;
        }

        draw(): Canvas {
            //draw chart area
            this.svg = d3.select(this._chart.selector)
                .append("svg")
                .attr("width", this.width + this.padding * 2 + this._chart.legend.width)
                .attr("height", this.height + this.padding * 2);

            // draw title area
            this.svg.append("line")
                .attr("class", "sep")
                .attr("x1", 0)
                .attr("y1", this._chart.title.height)
                .attr("x2", this.width + this.padding * 2 + this._chart.legend.width)
                .attr("y2", this._chart.title.height);

            // draw legend area
            this.svg.append("line")
                .attr("class", "sep")
                .attr("x1", this.width + this.padding * 2)
                .attr("y1", this._chart.title.height)
                .attr("x2", this.width + this.padding * 2)
                .attr("y2", this.height + this.padding * 2);

            return this;
        }
    }

    export class Series {
        private _chart: Chart;
        private _items: Serie[];

        labels: string[];
        length: number;
        matrix: any[];

        constructor(chart: Chart) {
            this._chart = chart;
            this._items = chart.settings.isSet("series") ? this._setSeries(chart.settings.getValue("series")) : this._setSeries([]);

            this.labels = this._setLabels();
            this.length = this._items.length;
            this.matrix = this._setStackedMatrix();
        }

        private _getMappedMatrix() {
            var matrix = [];
            for (var serie = 0; serie < this._items.length; serie++) {
                matrix.push(this._items[serie].getValues());
            }

            var mappedMatrix = matrix.map(function (data, i) {
                var t = matrix[i];
                return t.map(function (d, j) {
                    return { y: d, y0: 0, size: 0, perc: 0 };
                })
            });

            return mappedMatrix;
        }

        private _setStackedMatrix() {
            var matrix = this._getMappedMatrix();

            var transposedMatrix = this._transposeMatrix(matrix);

            transposedMatrix.forEach(function (m) {
                var posBase = 0, negBase = 0, sum = 0;
                
                m.forEach(function (k) {
                    sum = sum + k.y;
                });

                m.forEach(function (k) {
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

        private _setLabels() {
            var names: string[] = [];
            for (var i = 0; i < this._items.length; i++) {
                names.push(this._items[i].getName(i));
            }
            return names;
        }

        private _setSeries(series: any) {
            var array: Serie[] = [];
            for (var i = 0; i < series.length; i++) {
                array.push(new Serie(series[i]));
            }
            return array;
        }

        private _transposeMatrix(a) {
            return Object.keys(a[0]).map(
                function (c) { return a.map(function (r) { return r[c]; }); }
                );
        }

        getColor(i: number) {
            return this._items[i].getColor(i);
        }

        getName(i: number) {
            return this._items[i].getName(i);
        }

        getMatrixSum() {  //TODO: should be removed - needed for pie chart, but one pie chart per serie should be created
            var array: number[] = []
            for (var i = 0; i < this._items.length; i++) {
                array.push(this._items[i].sum);
            }
            return array;
        }
                        
        getMaxValue() {
            var matrix = null;
            if ((this._chart instanceof FRNK.UI.Charts.StackedBarChart || this._chart instanceof FRNK.UI.Charts.StackedLineChart) && this._items.length > 1) // can only be stacked if you have more than 1 series defined
                return d3.max(this.matrix, function (array) {
                    return d3.max(array, function (d: any) {
                        return d.y0 + d.y;
                    });
                });
            else
                return d3.max(this.matrix, function (array) {
                    return d3.max(array, function (d: any) {
                        return d.y;
                    });
                });
        }

        getMinValue() {
            var matrix = null;
            if ((this._chart instanceof FRNK.UI.Charts.StackedBarChart || this._chart instanceof FRNK.UI.Charts.StackedLineChart) && this._items.length > 1) // can only be stacked if you have more than 1 series defined
                return d3.min(this.matrix, function (array) {
                    return d3.min(array, function (d: any) {
                        return d.y0 + d.y;
                    });
                });
            else
                return d3.min(this.matrix, function (array) {
                    return d3.min(array, function (d: any) {
                        return d.y;
                    });
                });
        }

        getSerie(i: number) {
            return this._items[i]; 
        }
    }

    export class Serie {
        private _color: string;
        private _fillColor: string; 
        private _data: number[];
        private _name: string;

        max: number;
        min: number;
        sum: number;

        constructor(serie: any) {
            this._color = serie.color;
            this._fillColor = serie.fillColor;
            this._data = serie.data;
            this._name = serie.name;

            this.max = d3.max(this._data);
            this.min = d3.min(this._data);
            this.sum = d3.sum(this._data);
        }

        getColor(i?: number) {
            if (this._color != null)
                return this._color;
            return ColorPalette.getColor(i);
            //TODO - fallback in case bigger than 20 series
        }

        getFillColor(i?: number) {
            if (this._fillColor != null)
                return this._fillColor;
            return ColorPalette.getFillColor(i);
            //TODO - fallback in case bigger than 20 series
        }

        getName(i: number) {
            if (this._name != null)
                return this._name;
            return "Serie " + (i + 1);
        }

        getValues() {
            return this._data;
        }
    }

    export class Title {
        private _chart: Chart;

        text: string;
        subTitle: string;
        align: string;
        height: number;

        constructor(chart: Chart) {
            this._chart = chart;

            this.align = chart.settings.isSet("title.align") ? chart.settings.getValue("title.align") : "center";
            this.height = chart.settings.isSet("title.height") ? chart.settings.getValue("title.height") : 50;
            this.subTitle = chart.settings.isSet("title.subTitle") ? chart.settings.getValue("title.subTitle") : "";
            this.text = chart.settings.isSet("title.text") ? chart.settings.getValue("title.text") : "";
        }

        draw() {
            // get text
            var svgTitle = this._chart.canvas.svg.append("text")
                .text(this.text)
                .attr("class", "title");

            // calculate alignment
            var textLength = svgTitle.node().clientWidth;
            var textHeight = svgTitle.node().clientHeight;

            var x;
            switch (this.align) {
                case "left":
                    x = 0;
                    break;
                case "center":
                    x = (this._chart.canvas.width + this._chart.legend.width - textLength) /2;
                    break;
                case "right":
                    x = this._chart.canvas.width + this._chart.legend.width - textLength;
                    break;
            }

            var y = (this.height + textHeight) / 2;

            // set title position
            svgTitle
                .attr("x", function (d) { return x; })
                .attr("y", function (d) { return y; });
        }
    }

    export class Legend {
        private _chart: Chart;

        title: string;
        height: number;
        placement: string;
        width: number;

        constructor(chart: Chart) {
            this._chart = chart;

            this.title = chart.settings.isSet("legend.title") ? chart.settings.getValue("legend.title") : "";
            this.height = chart.settings.isSet("legend.height") ? chart.settings.getValue("legend.height") : 0;
            this.placement = chart.settings.isSet("legend.placement") ? chart.settings.getValue("legend.placement") : "none";
            this.width = chart.settings.isSet("legend.width") ? chart.settings.getValue("legend.width") : 0;
        }

        draw() {
            var _this = this;

            var legend = _this._chart.canvas.svg.append("g")
                .attr("class", "legend")
                .selectAll(".item")
                .data(_this._chart.series.matrix)
                .enter().append("g")
                .attr("class", "item")
                .attr("transform", function (d, i) { return "translate(" + 30 + "," + (_this._chart.title.height + (i * 20) + 20) + ")"; });

            legend.append("rect")
                .attr("x", _this._chart.canvas.width + _this._chart.canvas.padding * 2 - 11)
                .attr("width", 15)
                .attr("height", 11)
                .style("fill", function (d, i) { return _this._chart.series.getColor(i); });

            legend.append("text")
                .attr("x", _this._chart.canvas.width + _this._chart.canvas.padding * 2 + 9)
                .attr("y", 9)
                .attr("dy", "0px")
                .style("text-anchor", "begin")
                .text(function (d, i) { return _this._chart.series.getName(i); });
        }
    }

    // TODO - Refactor
    export class PlotOptions {
        private _chart: Chart;

        innerPadding: number;
        outerPadding: number;

        constructor(chart: Chart) {
            this._chart = chart;

            this.innerPadding = chart.settings.isSet("plotOptions.general.innerPadding") ? chart.settings.getValue("plotOptions.general.innerPadding") : 0.5;
            this.outerPadding = chart.settings.isSet("plotOptions.general.outerPadding") ? chart.settings.getValue("plotOptions.general.outerPadding") : 0;
        }
    }

    export class Axis {
        private _gridlineType: GridLineType;
        private _scaleType: ScaleType;

        categories: any[];
        format: string;
        position: string;
        scale: any;
        ticks: number;
        title: string;

        constructor(args: any, chart: Chart) {
            this._gridlineType = GridLineType.None;
            this.categories = null;
            this.position = null;
            this.scale = null;
            this.ticks = null;
            this.title = null;
        }

        setScaleType(value: ScaleType) {
            this._scaleType = value;
        }

        getGridlineType() : GridLineType {
            return this._gridlineType;
        }

        isDataAxis() : boolean {
            if (typeof (this.categories) != "undefined") {
                return false;
            }
            return true;
        }

        isOrdinalScale(): boolean {
            if (this._scaleType === ScaleType.Ordinal)
                return true;
            return false;
        }

        isLinearScale(): boolean {
            if (this._scaleType === ScaleType.Linear)
                return true;
            return false;
        }

        isTimeScale(): boolean {
            if (this._scaleType === ScaleType.Time)
                return true;
            return false;
        }

        parseCategory(value: string) : any { //TODO: add return type
            if (this.format == "%s")
				return value;
			else if (this.format == "%n")
				return value;
			else
				return d3.time.format(this.format).parse(value);
        }

        setGridlineType(type: string) {
            if (type.toUpperCase() == "MAJOR")
				this._gridlineType = GridLineType.Major;
            else if (type.toUpperCase() == "MINOR")
				this._gridlineType = GridLineType.Minor;
			else
                this._gridlineType = GridLineType.None;
        }

        draw(chart: Chart) {
            // child classes are responsible for implementing this method
        }

        drawGridlines(chart: Chart, axis: D3.Svg.Axis, offset: number) {
            // child classes are responsible for implementing this method
        }
    }

    export class XAxis extends Axis {

        private _textRotation: string;

        constructor(args: any, chart: Chart) {
            super(args, chart);
            this.categories = args.xAxis.categories;
            this.setGridlineType(args.xAxis.gridlines);
            this.position = chart.settings.isSet("xAxis.position") ? chart.settings.getValue("xAxis.position") : "bottom";
            this.format = args.xAxis.format;
            this.scale = this._setScale(chart);
            this.ticks = args.xAxis.ticks;
            this.title = chart.settings.isSet("xAxis.title.text") ? chart.settings.getValue("xAxis.title.text") : "";
            
            this._textRotation = chart.settings.isSet("xAxis.labels.rotate") ? chart.settings.getValue("xAxis.labels.rotate") : "0";
        }

        private _setScale(chart: Chart): any {
            var _this = this;
            if (_this.format == "%s") {
				_this.setScaleType(ScaleType.Ordinal);
				return d3.scale.ordinal()
					.domain(_this.categories)
					.rangeBands([0, chart.canvas.width], chart.plotOptions.innerPadding, chart.plotOptions.outerPadding);
			}
			else if (_this.format == "%n") {
				_this.setScaleType(ScaleType.Linear);
				return d3.scale.linear()
					.domain([chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0, chart.series.getMaxValue()])
					.nice() // adds additional ticks to add some whitespace  
					.range([0, chart.canvas.width]);
			}
			else {
				_this.setScaleType(ScaleType.Time);
				return d3.time.scale()
					.domain(d3.extent(_this.categories, function (d) { return d3.time.format(_this.format).parse(d); }))
					.nice() // adds additional ticks to add some whitespace  
					.range([0, chart.canvas.width]);
            }
        }

        draw(chart: Chart) : Canvas {
            var _this = this;

            super.draw(chart);

            // create d3 axis
            var d3Axis = d3.svg.axis()
                .scale(_this.scale)
                .orient(_this.position)
                .ticks(_this.ticks);

            // get offset to determine position
            var offset = this.getOffset(chart);

            // draw x-axis
            var svgAxis = chart.canvas.svg.append("g")
                .attr("class", "axis x-axis")
                .attr("transform", "translate(" + chart.canvas.padding + "," + offset + ")")
                .call(d3Axis)

            // rotate labels
            if (this._textRotation != "0") {
                svgAxis.selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(" + this._textRotation + ")");
            }

            // draw title
            var svgTitle = svgAxis.append("text")
                .text(this.title)
                .attr("transform", "translate(" + chart.canvas.width + "," + "20" + ")");
                         
            // draw gridlines
            _this.drawGridlines(chart, d3Axis, offset);

            return chart.canvas;
        }

        drawGridlines(chart: Chart, axis: D3.Svg.Axis, offset: number) : Canvas {
            var _this = this;

            // draw grid
            var svgGrid = chart.canvas.svg.append("g")
                .attr("class", "x-axis grid")
                .attr("transform", "translate(" + chart.canvas.padding + "," + offset + ")");

            // draw gridlines
            switch (_this.getGridlineType()) {
                case GridLineType.Major: 
                    svgGrid.call(axis
                        .tickSize(-chart.canvas.height + chart.title.height, 0)
                        .tickFormat(function (d) { return ""; }) // return no label for the grid lines
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
                    .attr("y2", _this.position == "bottom" ? -chart.canvas.height : chart.canvas.height);
            }

            return chart.canvas;
        }

        getOffset(chart: Chart) {
            if (this.position == "bottom")
                return chart.canvas.height + chart.canvas.padding;
            else
                return chart.canvas.padding;
        }
    }

    export class YAxis extends Axis {

        constructor(args: any, chart: Chart) {
            super(args, chart);
            this.categories = args.yAxis.categories;
            this.format = args.yAxis.format;
            this.setGridlineType(args.yAxis.gridlines);
            this.position = chart.settings.isSet("yAxis.position") ? chart.settings.getValue("yAxis.position") : "left";
            this.scale = this._setScale(chart);
            this.ticks = args.yAxis.ticks;
            this.title = chart.settings.isSet("yAxis.title.text") ? chart.settings.getValue("yAxis.title.text") : "";
        }

        private _setScale(chart: Chart): any {
            var _this = this;

            if (_this.format == "%s") {
				_this.setScaleType(ScaleType.Ordinal);
				return d3.scale.ordinal()
					.domain(_this.categories)
					.rangeRoundBands([0, chart.canvas.height - chart.title.height], chart.plotOptions.innerPadding, chart.plotOptions.outerPadding); 
			}
            else if (_this.format == "%n") {                    
				_this.setScaleType(ScaleType.Linear);
				return d3.scale.linear()
					.domain([chart.series.getMaxValue(), chart.series.getMinValue() < 0 ? chart.series.getMinValue() : 0])
					.nice() // adds additional ticks to add some whitespace 
					.range([0, chart.canvas.height - chart.title.height]);
			}
            else {
				_this.setScaleType(ScaleType.Time);
				return d3.time.scale()
					.domain(d3.extent(_this.categories, function (d) { return d3.time.format(_this.format).parse(d); }).reverse())
					.nice() // adds additional ticks to add some whitespace  
					.range([chart.series.getMinValue(), chart.canvas.height - chart.title.height]);
            }
        }

        draw(chart: Chart) : Canvas {
		    var _this = this;

            super.draw(chart);

            // create d3 axis 
            var d3Axis = d3.svg.axis()
                .scale(_this.scale)
                .orient(_this.position)
                .ticks(_this.ticks);

            // get offset to determine position
            var offset = this.getOffset(chart);

            // draw y-axis
            var svgAxis = chart.canvas.svg.append("g")
                .attr("class", "axis y-axis")
                .attr("transform", "translate(" + offset + "," + (chart.canvas.padding + chart.title.height) + ")")
                .call(d3Axis)
                .append("text")
                .attr("x", 0)
                .attr("y", -20)
                .attr("dx", "0em")
                .style("text-anchor", "middle")
                .text(_this.title);

            // draw title
            // TODO - draw title as separate action

            // draw gridlines
            _this.drawGridlines(chart, d3Axis, offset);

            return chart.canvas;
        }

        drawGridlines(chart: Chart, axis: D3.Svg.Axis, offset: number) : Canvas {
            var _this = this;

            //draw grid
            var svgGrid = chart.canvas.svg.append("g")
                .attr("class", "y-axis grid")
                .attr("transform", "translate(" + offset + "," + (chart.canvas.padding + chart.title.height) + ")");

            // draw gridlines
            switch (_this.getGridlineType()) {
                case GridLineType.Major:
                    svgGrid.call(axis
                        .tickSize(-chart.canvas.width, 0)
                        .tickFormat(function (d) { return ""; }) // return no label for the grid lines
                    );                    
                    break;
                case GridLineType.Minor:
                    //TODO
                    break;
                default:
                    break;
            }

            // draw zero line
            if (_this.isDataAxis() && chart.series.getMinValue() < 0) {
                svgGrid.append("g")
                    .attr("class", "zero-line")
                    .append("line")
                    .attr("x1", 0)
                    .attr("x2", _this.position == "left" ? chart.canvas.width : -chart.canvas.width)
                    .attr("y1", this.scale(0))
                    .attr("y2", this.scale(0));
            }

            return chart.canvas;
        }

        getOffset(chart: Chart) : number {
            if (this.position == "left")
                return chart.canvas.padding;
            else
                return chart.canvas.width + chart.canvas.padding;
        }
    }

    export class Chart {
        canvas: Canvas;
        categories: string[];
        title: Title;
        legend: Legend;
        plotOptions: PlotOptions;
        series: Series;
        settings: Settings;
        selector: string;

        constructor(args: any, selector: string) {
            this.settings = new Settings(args);
            this.title = new Title(this);
            this.legend = new Legend(this);
            this.canvas = new Canvas(this);
            this.plotOptions = new PlotOptions(this);
            this.series = new Series(this);
            this.selector = selector;
        }

        draw() : Canvas {
            var _this = this;

            // draw canvas
            _this.canvas.draw();

            // title
            _this.title.draw();

            // draw legend
            _this.legend.draw();

            return _this.canvas;
        }


    }

    export class XYChart extends Chart {
        xAxis: XAxis;
        yAxis: YAxis;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.xAxis = new XAxis(args, this);
            this.yAxis = new YAxis(args, this);
        }

        draw() : Canvas {
            var _this = this;

            super.draw();

            _this.xAxis.draw(this);
            _this.yAxis.draw(this);

            return _this.canvas; 
        }
    }

    export class LineChart extends XYChart {
        showMarkers: boolean;
        interpolation: string; 
        fillArea: boolean;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.showMarkers = this.settings.getValue("plotOptions.line.showMarkers") == "yes" ? true : false;
            this.interpolation = this.settings.isSet("plotOptions.line.interpolation") ? this.settings.getValue("plotOptions.line.interpolation") : "linear";
            this.fillArea = this.settings.getValue("plotOptions.line.fillArea") == "yes" ? true : false;
        }

        draw() : Canvas {
            var _this = this;

            super.draw();

            // draw chart
            var svgAreas = _this.canvas.svg.append("g")
                .attr("class", "areas");
            
            var svgSeries = _this.canvas.svg.append("g")
                .attr("class", "series");

            // draw areas
            // areas need to be drawn first, because the line and markers need to be drawn on top of it
            if (_this.fillArea) {
                for (var j = 0; j < _this.series.length; j++) {
                    var svgArea = svgAreas.append("g")
                        .attr("id", "area-" + j);

                    this.drawArea(svgArea, j);
                }
            }

            // draw lines
            for (var j = 0; j < _this.series.length; j++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + j);

                // draw line
                var svgLine = this.drawLine(svgSerie, j);

                // draw markers
                if (_this.showMarkers) {
                    var svgMarkers = this.drawMarkers(svgSerie, j);

                    // draw tooltip
                    var svgTooltip = this.drawTooltip(svgMarkers, j);
                }
            }

            return _this.canvas;
        }

        drawArea(svg: D3.Selection, serie: number) {
            var _this = this;
            var d3Area: D3.Svg.Area;

            if (_this.xAxis.isDataAxis()) {
                d3Area = d3.svg.area()
                    .interpolate(_this.interpolation)
                    .x(_this.getXCoordinate(serie))
                    .x0(_this.xAxis.scale(0) + _this.canvas.padding)
                    .y(_this.getYCoordinate(serie));
            }
            else {
                d3Area = d3.svg.area()
                    .interpolate(_this.interpolation)
                    .x(_this.getXCoordinate(serie))
                    .y0(_this.yAxis.scale(0) + _this.canvas.padding + _this.title.height )
                    .y1(_this.getYCoordinate(serie));
            }

            var svgArea = svg.append("path")
                .attr("class", "area")
                .attr("d", d3Area(_this.series.matrix[serie]))
                .style("fill", _this.series.getColor(serie))
                .style("opacity", "0.2");

            return svgArea;
        }

        drawLine(svg: D3.Selection, serie: number) {
            var _this = this;

            var d3Line = d3.svg.line()
                .interpolate(_this.interpolation)
                .x(_this.getXCoordinate(serie))
                .y(_this.getYCoordinate(serie));

            var svgLine = svg.append("path")
                .attr("class", "line")
                .attr("d", d3Line(_this.series.matrix[serie]))
                .attr("stroke", _this.series.getColor(serie))
                .attr("stroke-width", 1)
                .attr("fill", "none");

            return svgLine;
        }

        drawMarkers(svg: D3.Selection, serie: number) {
            var _this = this;

            var svgMarkers = svg.selectAll(".marker")
                .data(_this.series.matrix[serie])
                .enter().append("circle")
                .attr("class", "marker")
                .attr("stroke", _this.series.getColor(serie))
                .attr("stroke-width", "0")
                .attr("fill", _this.series.getColor(serie))
                .attr("cx", _this.getXCoordinate(serie))
                .attr("cy", _this.getYCoordinate(serie))
                .attr("r", function (d, i) { return 3 });

            return svgMarkers;
        }

        drawTooltip(svg: D3.Selection, serie: number) {
            var svgTooltip = svg.append("title")
                .text(function (d) {
                return d.y;
                });

            return svgTooltip;
        }

        getXCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    return _this.canvas.padding + _this.xAxis.scale(d.y);
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    if (_this.xAxis.isOrdinalScale()) {
                        return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i])) + _this.xAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i]));  
                    }
                }; 
        }

        getYCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    if (_this.yAxis.isOrdinalScale())
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i])) + _this.yAxis.scale.rangeBand() / 2;
                    else
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i]));
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    return _this.canvas.padding + _this.title.height + _this.yAxis.scale(d.y);
                };
        }
    }

    export class StackedLineChart extends LineChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        drawArea(svg: D3.Selection, serie: number) {
            var _this = this;
            var d3Area: D3.Svg.Area;

            if (_this.xAxis.isDataAxis()) {
                d3Area = d3.svg.area()
                    .interpolate(_this.interpolation)
                    .x(_this.getXCoordinate(serie))
                    .x0(
                    function (d) {
                        // negative values
                        if (d.y < 0) {
                            return (_this.xAxis.scale(d.y0) + _this.canvas.padding);
                        }
                        // postive values
                        else {
                            return (_this.xAxis.scale(d.y0 - d.y) + _this.canvas.padding);
                        }
                    })
                    .y(_this.getYCoordinate(serie));
            }
            else {
                d3Area = d3.svg.area()
                    .interpolate(_this.interpolation)
                    .x(_this.getXCoordinate(serie))
                    .y0(
                    function (d) {
                        // negative values
                        if (d.y < 0) {
                            return (_this.yAxis.scale(d.y0) + _this.title.height + _this.canvas.padding);
                        }
                        // postive values
                        else {
                            return (_this.yAxis.scale(d.y0 - d.y) + _this.title.height + _this.canvas.padding);
                        }
                    })
                    .y1(_this.getYCoordinate(serie));
            }

            var svgArea = svg.append("path")
                .attr("class", "area")
                .attr("d", d3Area(_this.series.matrix[serie]))
                .style("fill", _this.series.getColor(serie))
                .style("opacity", "0.2");

            return svgArea;
        }

        drawTooltip(svg: D3.Selection) {
            return svg.append("title")
                .text(function (d) {
                if (d.y < 0) {
                    return d.y + d.y0;
                }
                else {
                    return d.y0;
                }
            });
        }

        getXCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    // negative numbers                                        
                    if (d.y0 < 1) {
                        return _this.canvas.padding + _this.xAxis.scale(d.y0 + d.y);
                    }
                    // positive numbers
                    else { 
                        return _this.canvas.padding + _this.xAxis.scale(d.y0);
                    }
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    if (_this.xAxis.isOrdinalScale() || _this.xAxis.isLinearScale()) {
                        return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i])) + _this.xAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i])); // for time scales
                    }
                };
        }

        getYCoordinate(serie: number) {
            var _this = this;

            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    if (_this.yAxis.isOrdinalScale() || _this.yAxis.isLinearScale()) {
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i])) + _this.yAxis.scale.rangeBand() / 2;
                    }
                    else {
                        return _this.canvas.padding + _this.title.height +_this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i])); // for time scales
                    }
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    // negative numbers                                        
                    if (d.y0 < 1) { //TODO -  I think this only works for whole numbers
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(d.y0 + d.y);
                    }
                    // positive numbers
                    else { 
                        return _this.canvas.padding + _this.title.height +_this.yAxis.scale(d.y0);
                    }
                };
        }
    }

    export class BarChart extends XYChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        draw() : Canvas {
            var _this = this;

            super.draw();

            // draw chart
            var svgSeries = _this.canvas.svg.append("g")
                .attr("class", "series");

            // draw bars
            for (var j = 0; j < _this.series.length; j++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + j)
                    .selectAll("rect")
                    .data(_this.series.matrix[j])
                    .enter();
                
                // draw bar
                var svgBar = svgSerie.append("rect")
                    .attr({
                    "x": _this.getXCoordinate(j),
                    "y": _this.getYCoordinate(j),
                    "class": "bar",
                    "width": _this.getWidth(j),
                    "height": _this.getHeight(j),
                    "fill": _this.series.getColor(j)
                });

                // draw tooltip
                var svgTooltip = svgBar.append("title")
                    .text(function (d) { return d.y; });

                
                // draw labels
                /*
                var svgLabels = svgSerie.append("text")
                    .attr("x", _this.getXCoordinate(j))
                    .attr("y", _this.getYCoordinate(j))
                    .attr("fill", "#878787")
                    .attr("dy", "-.5em")
                    .text(function (d) { return parseFloat(d.y).toFixed(2); });
                */
            }

            return _this.canvas;
        }

        getXCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    if (d.y < 0)
                        return _this.canvas.padding + _this.xAxis.scale(0) - Math.abs(_this.xAxis.scale(d.size) - _this.xAxis.scale(0));
                    else
                        return _this.canvas.padding + _this.xAxis.scale(0);
                };

            if (_this.yAxis.isDataAxis()) {
                return function (d, i) {
                    if (_this.xAxis.isOrdinalScale()) {
                        return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i])) + (_this.xAxis.scale.rangeBand() / _this.series.length * serie);
                    }
                    else
                        return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i])) + (_this.canvas.width / _this.series.length / _this.series.matrix[0].length * serie);
                }
            }
        }

        getYCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis()) {
                return function (d, i) {
                    if (_this.yAxis.isOrdinalScale())
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i])) + (_this.yAxis.scale.rangeBand() / _this.series.length * serie);
                    else
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i])) + (_this.canvas.width / _this.series.length / _this.series.matrix[0].length / _this.series.length * serie);
                }
            }

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    if (d.y < 0) {
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(d.y) - Math.abs(_this.yAxis.scale(d.size) - _this.yAxis.scale(0));
                    }
                    else {
                        return _this.canvas.padding + _this.title.height + _this.yAxis.scale(d.y);
                    }
                };
        }

        getHeight(serie: number) : any {
            var _this = this;
            if (_this.xAxis.isDataAxis()) {
                return function (d, i) {
                    if (_this.yAxis.isOrdinalScale()) {
                        return Math.abs(_this.yAxis.scale.rangeBand() / _this.series.length);
                    }
                    else {
                        return Math.abs(_this.canvas.width / _this.series.length / _this.series.matrix[0].length / _this.series.length);
                    }
                }
            }

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    return Math.abs(_this.yAxis.scale(d.y) - _this.yAxis.scale(0));
                };
        }

        getWidth(serie: number) : any {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    return Math.abs(_this.xAxis.scale(d.y) - _this.xAxis.scale(0));
                };

            if (_this.yAxis.isDataAxis()) {
                return function (d, i) {
                    if (_this.xAxis.isOrdinalScale()) 
                        return _this.xAxis.scale.rangeBand() / _this.series.length;
                    else
                        return _this.canvas.width / _this.series.length / _this.series.matrix[0].length ;
                }
            }
        }
    }

    export class StackedBarChart extends BarChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        draw() : Canvas {
            var _this = this;

            super.draw();

            return _this.canvas;
        }

        getXCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    return _this.canvas.padding + _this.xAxis.scale(0) - (_this.xAxis.scale(d.size) - _this.xAxis.scale(d.y0));
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    return _this.canvas.padding + _this.xAxis.scale(_this.xAxis.parseCategory(_this.xAxis.categories[i]));
                };
        }

        getYCoordinate(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis()) 
                return function (d, i) {
                    return _this.canvas.padding + _this.title.height + _this.yAxis.scale(_this.yAxis.parseCategory(_this.yAxis.categories[i]));
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    return _this.canvas.padding + _this.title.height + _this.yAxis.scale(d.y0);
                };
        }

        getHeight(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis()) 
                return function (d, i) {
                    if (_this.yAxis.isOrdinalScale() || _this.yAxis.isLinearScale())
                        return _this.yAxis.scale.rangeBand();
                    else
                        return _this.canvas.height / _this.series.length / _this.series.matrix[0].length;
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    return Math.abs(_this.yAxis.scale(0) - _this.yAxis.scale(d.size));
                };
        }

        getWidth(serie: number) {
            var _this = this;
            if (_this.xAxis.isDataAxis())
                return function (d, i) {
                    return Math.abs(_this.xAxis.scale(0) - _this.xAxis.scale(d.y));
                };

            if (_this.yAxis.isDataAxis())
                return function (d, i) {
                    if (_this.xAxis.isOrdinalScale() || _this.xAxis.isLinearScale()) {
                        return _this.xAxis.scale.rangeBand();
                    }
                    else
                        return _this.canvas.width / _this.series.length / _this.series.matrix[0].length; //did it to support time scales
                };
        }
    }

    export class PieChart extends Chart {
        innerRadius: number;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.innerRadius = this.settings.isSet("piechart.innerRadius") ? this.settings.getValue("piechart.innerRadius") : 0;
        }

        draw() : Canvas {
            var _this = this;

            super.draw();

            var radius = Math.min(_this.canvas.width, _this.canvas.height) / 2;

            var g = _this.canvas.svg.append("g")
                .attr("transform", "translate(" + (_this.canvas.width / 2 + _this.canvas.padding) + "," + (_this.canvas.height / 2 + _this.canvas.padding) + ")");

            var innerRadius = (_this.canvas.height < _this.canvas.width) ? _this.canvas.height : _this.canvas.width;
            var arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(radius - radius * _this.innerRadius); // inner radius = 0 => pie chart

            var pie = d3.layout.pie();

            var arcs = g.selectAll("g.slice")
                .data(pie(_this.series.getSerie(0).getValues()))
                .enter()
                .append("g")
                .attr("class", "slice");

            arcs.append("path")
                .attr("fill", function (d, i) { return _this.series.getSerie(0).getColor(i); })
                .attr("d", arc);

            // add text
            arcs.append("text")
                .attr("transform", function (d) {
                    d.innerRadius = 0;
                    d.outerRadius = radius;
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .text(function (d, i) { return _this.series.getSerie(0).getName(i); });
            
            // draw tooltip -- doesn't work
            arcs.append("title")
                .text(function (d) {
                return d.y;
            });
            return _this.canvas;
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

module FRNK.UI.Charts.ColorPalette {

    export function getColor(i: number): string {
        var _colors =
            [
                '#5491F6',
                '#7AC124',
                '#FFA300',
                '#129793',
                '#F16A73',
                '#1B487F',
                '#FF6409',
                '#CC0000',
                '#8E44AD',
                '#936A4A',
                '#2C5195',
                '#4B7717',
                '#D58A02',
                '#005D5D',
                '#BD535B',
                '#123463',
                '#980101',
                '#D85402',
                '#622E79',
                '#60452F'
            ];
        return _colors[i];
    }

    export function getFillColor(i: number): string {
        var _fillColors =
            [
                '#C9DCFE',
                '#D6EEAF',
                '#FFE4AF',
                '#B6E0DE',
                '#FCD2D4',
                '#BAC8D9',
                '#FFD0B0',
                '#F1B2B1',
                '#DDC6E7',
                '#DED2C7',
                '#BFCAE0',
                '#C9D7B8',
                '#F3DDB1',
                '#B1CECE',
                '#ECCBCD',
                '#B7C2D1',
                '#E1B2B1',
                '#F4CBB1',
                '#D0BFD8',
                '#CFC7C0'
            ];
        return _fillColors[i];
    }
}