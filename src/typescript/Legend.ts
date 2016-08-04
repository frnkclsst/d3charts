/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class LegendArea implements IArea {
        public symbolWidth: number = 24;

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

                this.drawSymbol(items);
                this.drawText(items);
            }
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
            if (this._chart instanceof LineChart) {
                this.drawSymbolAsLine(svg);
            }
            else {
                this.drawSymbolAsRectangle(svg);
            }
        }

        private drawSymbolAsLine(svg: D3.Selection): void {
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", this.symbolWidth)
                .attr("y1", 6)
                .attr("y2", 6)
                .style("stroke", (d: any, i: any): string => {
                    return this._chart.series.getColor(i);
                })
                .style("stroke-width", "2");

            svg.append("circle")
                .attr("cx", this.symbolWidth / 2)
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
                .attr("x", 0)
                .attr("width", this.symbolWidth)
                .attr("height", 11)
                .style("fill", (d: any, i: any): string => {
                    return this._chart.series.getColor(i);
                });
        }

        private drawText(svg: D3.Selection): void {
            svg.append("text")
                .attr("x", this.symbolWidth + 6)
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