/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Tooltip {
        public chart: Chart;
        public showPercentage: boolean;

        constructor(chart: Chart) {
            this.chart = chart;
            this.showPercentage = this.chart.settings.getValue("tooltip.showPercentage"); // TODO - Implement showpercent param
        }

        public draw(svg: D3.Selection, serie: number): void {
            var _self = this;

            var divTooltip = d3.select(_self.chart.selector).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            /*
            var divLine = d3.select(_self.chart.selector).append("div")
                .attr("class", "vertical-line")
                .style("position", "absolute")
                .style("z-index", "19");
            */

            svg.on("mouseover", function (d: any, i: number): void {
                    if (_self.chart instanceof PieChart) {
                        divTooltip.html("<div class='title'>" + _self.chart.settings.getValue("tooltip.title") + "</div>" +
                            "<div class='subtitle'>" + _self.chart.series.getLabel(serie) + "</div><br/>" +
                            "<div class='color' style='width:24px; height: 11px; background-color:" + ColorPalette.getColor(i) + "'></div>" +
                            "<div class='serie'>" + _self.chart.categories.getLabel(i) + "</div>" +
                            "<div class='value'>" + d3.format(_self.getPointFormat(serie))(d.value) + _self.getSuffix(serie) + "</div>"
                        );
                    }
                    else {
                        divTooltip.html("<div class='title'>" + _self.chart.settings.getValue("tooltip.title") + "</div>" +
                            "<div class='subtitle'>" + _self.chart.categories.getLabel(i) + "</div><br/>" +
                            "<div class='color' style='width:24px; height: 11px; background-color:" + ColorPalette.getColor(serie) + "'></div>" +
                            "<div class='serie'>" + _self.chart.series.getLabel(serie) + "</div>" +
                            "<div class='percent'>" + Math.round(d.perc * 100) + "%</div>" +
                            "<div class='value'>" + d3.format(_self.getPointFormat(serie))(d.y) + _self.getSuffix(serie) + "</div>"
                        );
                    }
                    divTooltip.transition()
                        .delay(300)
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mouseout", function(d: any): void {
                    divTooltip.transition()
                        .duration(100)
                        .style("opacity", 0);

                    /*
                    divLine.transition()
                        .duration(100)
                        .style("opacity", 0);
                    */
                })
                .on("mousemove", function(d: any): void {
                    divTooltip
                        .style("left", (d3.mouse(this.ownerSVGElement)[0]) - 50 + "px")
                        .style("top", (d3.mouse(this.ownerSVGElement)[1]) + 10 + "px");
                    /*
                    if (_self.chart instanceof LineChart) {
                        var mousex = d3.mouse(this);
                        divLine
                            .style("width", "1px")
                            .style("height", _self.chart.canvas.plotArea.height)
                            .style("top", _self.chart.canvas.padding + "px")
                            .style("bottom", "0px")
                            .style("left", "0px")
                            .style("background", "red");
                        mousex[0] = mousex[0] + 10;
                        divLine.style("left", (mousex[0] + _self.chart.canvas.padding + "px" );
                    }
                    */
                });
        }

        public getSuffix(serie: number): string {
            if (this.chart.settings.getValue("tooltip.valueSuffix") != "") {
                return this.chart.settings.getValue("tooltip.valueSuffix");
            }
            if (this.chart.series.items[serie].tooltipSuffix) {
                return this.chart.series.items[serie].tooltipSuffix;
            }
            return "";
        }

        public getPointFormat(serie: number): string {
            if (this.chart.settings.getValue("tooltip.valuePointFormat") != "") {
                return this.chart.settings.getValue("tooltip.valuePointFormat");
            }
            if (this.chart.series.items[serie].tooltipPointFormat) {
                return this.chart.series.items[serie].tooltipPointFormat;
            }
            return "";
        }
    }
}