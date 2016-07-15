/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Canvas implements IArea {
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

            // update canvas size
            this.updateCanvasSize();

            // draw areas
            this.title = new TitleArea(chart, this);
            this.legend = new LegendArea(chart, this);
            this.plotArea = new PlotArea(chart, this);
        }

        public draw(): void {
            // update canvas size
            this.updateCanvasSize();

            // draw chart area
            this.svg = d3.select(this._chart.selector)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            // draw title area
            this.title.draw();

            // draw legend area
            this.legend.draw();

            // draw plot area
            this.plotArea.draw();
        }

        public updateCanvasSize(): void {
            var container = d3.select(this._chart.selector);
            var width = Number(container.style("width").substring(0, container.style("width").length - 2));
            var height = Number(container.style("height").substring(0, container.style("height").length - 2));
            this.width = width == 0 ? this.width : width;
            this.height =  height == 0 ? this.height : height;
        }
    }

    export class TitleArea implements IArea {
        public align: string;
        public height: number;
        public subTitle: string;
        public svg: D3.Selection;
        public text: string;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart, canvas: Canvas) {
            this._chart = chart;

            this.align = chart.settings.getValue("title.align", "center");
            this.height = Number(chart.settings.getValue("title.height", "50"));
            this.subTitle = chart.settings.getValue("title.subTitle");
            this.text = chart.settings.getValue("title.text");
        }

        public draw(): void {
            // initialize
            this.width = this._chart.canvas.width;

            // get text
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "title")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("transform", "translate(0,0)");

            var svgTitle = this.svg.append("text")
                .text(this.text);

            // calculate alignment
            var svgText: any = this.svg.node();
            var textBox = svgText.getBBox();
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

    export class PlotArea implements IArea {
        public height: number;
        public width: number;
        public svg: D3.Selection;
        public padding: number;

        private _canvas: Canvas;
        private _chart: Chart;

        constructor(chart: Chart, canvas: Canvas) {
            this._chart = chart;
            this._canvas = canvas;

            this.padding = this._chart.settings.getValue("canvas.padding", "20");
            this.height = this._canvas.height - this._canvas.title.height - this.padding * 2;
            this.width = this._canvas.width - this.padding * 2 - this._canvas.legend.width;
        }

        public draw(): void {
            // initialize
            this.height = this._canvas.height - this._canvas.title.height - this.padding * 2;
            this.width = this._canvas.width - this.padding * 2 - this._canvas.legend.width;

            // draw plot area
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "plotarea")
                .attr("transform", "translate(" + this._chart.canvas.plotArea.padding + "," + (this._chart.canvas.title.height + this._chart.canvas.plotArea.padding) + ")");
        }
    }

    export class LegendArea implements IArea {
        public height: number;
        public position: string;
        public title: string;
        public svg: D3.Selection;
        public width: number;

        private _chart: Chart;
        private _canvas: Canvas;

        constructor(chart: Chart, canvas: Canvas) {
            this._chart = chart;
            this._canvas = canvas;

            this.height = Number(chart.settings.getValue("legend.height", "0"));
            this.position = chart.settings.getValue("legend.position", "right");
            this.title = chart.settings.getValue("legend.title", "Categories");
            this.width = Number(chart.settings.getValue("legend.width", "0"));
        }

        public draw(): void {
            if (this.width != 0) {
                this.svg = this._canvas.svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(" + (this._canvas.width - this.width) + "," + this._canvas.title.height + ")");

                this.drawLine(this.svg);
                this.drawTitle(this.svg);

                // add legend items
                var items = this.svg
                    .selectAll(".item")
                    .data(this._chart.series.getMatrix())
                    .enter().append("g")
                    .attr("class", "item")
                    .attr("transform", (d: any, i: any): string => {
                        return "translate(" + 22 + "," + ((i * 20) + 60) + ")";
                    });

                this.drawCheckboxes(items);
                this.drawSymbol(items);
                this.drawText(items);
            }
        }

        private drawCheckboxes(svg: D3.Selection): void {
            // add checkboxes
            svg.append("image")
                .attr("class", "checkbox")
                .attr("height", "15px")
                .attr("width", "15px")
                .attr("href", "../images/checkbox-selected.png");
        }

        private drawLine(svg: D3.Selection): void {
            // draw vertical line
            svg.append("line")
                .attr("class", "sep")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", this._canvas.height - this._canvas.title.height);
        }

        private drawSymbol(svg: D3.Selection): void {
            if (this._chart instanceof frnk.UI.Charts.LineChart) {
                this.drawSymbolAsLine(svg);
            }
            else {
                this.drawSymbolAsRectangle(svg);
            }
        }

        private drawSymbolAsLine(svg: D3.Selection): void {
            svg.append("line")
                .attr("x1", 27)
                .attr("x2", 51)
                .attr("y1", 6)
                .attr("y2", 6)
                .style("stroke", (d: any, i: any): string => {
                    return this._chart.series.getColor(i);
                })
                .style("stroke-width", "2");

            svg.append("circle")
                .attr("cx", 39)
                .attr("cy", 6)
                .attr("r", 4)
                .style("fill", "#fff")
                .style("stroke", (d: any, i: any): string => {
                    return this._chart.series.getColor(i);
                })
                .style("stroke-width", "2");
        }

        private drawSymbolAsRectangle(svg: D3.Selection): void {
            svg.append("rect")
                .attr("x", 27)
                .attr("width", 24)
                .attr("height", 11)
                .style("fill", (d: any, i: any): string => {
                    return this._chart.series.getColor(i);
                });
        }

        private drawText(svg: D3.Selection): void {
            svg.append("text")
                .attr("x", 56)
                .attr("y", 9)
                .attr("dy", "0px")
                .style("text-anchor", "begin")
                .text((d: any, i: any): string => {
                    return this._chart.series.getLabel(i);
                });
        }

        private drawTitle(svg: D3.Selection): void {
            // draw horizontal line
            var svgTitle = svg.append("g")
                .attr("class", "title");

            svgTitle.append("line")
                .attr("class", "sep")
                .attr("x1", 20)
                .attr("y1", 40)
                .attr("x2", this.width - 20)
                .attr("y2", 40);

            // add legend title
            svgTitle.append("text")
                .attr("class", "title")
                .text(this.title)
                .attr("x", 22)
                .attr("y", 26);
        }
    }
}