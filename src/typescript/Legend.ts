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
        private _items: string[];

        constructor(settings: ILegendAreaSettings, chart: Chart) {
            this._chart = chart;

            this.height = settings.height;
            this.position = settings.position;
            this.title = settings.title;
            this.width = settings.width;
        }

        public draw(): void {
            if (this._chart instanceof PieChart) {
                this._items = this._chart.categories.getLabels();
            }
            else {
                this._items = this._chart.series.getLabels();
            }

            if (this.width == 0) {
                return;
            }

            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (this._chart.canvas.width - this.width) + "," + this._chart.settings.title.height + ")");

            this.drawLine(this.svg);
            this.drawTitle(this.svg);

            // add legend items
            var items = this.svg
                .selectAll(".item")
                .data(this._items)
                .enter().append("g")
                .attr("class", "item")
                .attr("transform", (d: any, i: any): string => {
                    return "translate(" + 22 + "," + ((i * 20) + 60) + ")";
                });

            this.drawSymbol(items);
            this.drawText(items);
        }

        private drawLine(svg: D3.Selection): void {
            // draw vertical line
            svg.append("line")
                .attr("class", "sep")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", this._chart.canvas.height - this._chart.settings.title.height);
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
                    return ColorPalette.getColor(i);
                })
                .style("stroke-width", "2");

            svg.append("circle")
                .attr("cx", this.symbolWidth / 2)
                .attr("cy", 6)
                .attr("r", 4)
                .style("fill", "#fff")
                .style("stroke", (d: any, i: any): string => {
                    return ColorPalette.getColor(i);
                })
                .style("stroke-width", "2");
        }

        private drawSymbolAsRectangle(svg: D3.Selection): void {
            svg.append("rect")
                .attr("x", 0)
                .attr("width", this.symbolWidth)
                .attr("height", 11)
                .style("fill", (d: any, i: any): string => {
                    return ColorPalette.getColor(i);
                });
        }

        private drawText(svg: D3.Selection): void {
            svg.append("text")
                .attr("x", this.symbolWidth + 6)
                .attr("y", 9)
                .attr("dy", "0px")
                .style("text-anchor", "begin")
                .text((d: any, i: any): string => {
                    return this._items[i];
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