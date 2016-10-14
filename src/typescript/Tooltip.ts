/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Tooltip {
        public chart: Chart;
        public showPercentage: boolean;

        constructor(chart: Chart) {
            this.chart = chart;
            // TODO - Implement showpercent param
            this.showPercentage = this.chart.options.getValue("tooltip.showPercentage");
        }

        public draw(svg: D3.Selection, serie: number): void {
            var _self = this;

            var divTooltip = d3.select(_self.chart.selector).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.on("mouseover", function (d: any, i: number): void {
                var title = _self.chart.options.getValue("tooltip.title");
                var subtitle = _self.chart.categories.getLabel(i);
                var color = ColorPalette.color(serie);
                var serieTitle = _self.chart.series.getLabel(serie);
                var dataPoint = d.y;
                var percent = d.perc;

                if (_self.chart instanceof PieChart) {
                    color = ColorPalette.color(i);
                    subtitle = _self.chart.series.getLabel(serie);
                    serieTitle = _self.chart.categories.getLabel(i);
                    dataPoint = d.value;
                    percent = _self.chart.series.getMatrixItem(serie)[i].perc;
                }

                if (_self.chart instanceof ScatterChart) {
                    color = ColorPalette.color(serie - 1);
                }

                divTooltip.html("<div class='title'>" + title + "</div>" +
                    "<div class='subtitle'>" + subtitle + "</div><br/>" +
                    "<div>" +
                        "<div class='color' style='width:24px; height: 11px; background-color:" + color + "'></div>" +
                        "<div class='serie'>" + serieTitle + "</div>" +
                        "<div class='percent'>" + Math.round(percent * 100) + "%</div>" +
                        "<div class='value'>" + d3.format(_self.getPointFormat(serie))(dataPoint) + _self.getSuffix(serie) + "</div>" +
                    "</div>"
                );

                // add animation
                divTooltip.transition()
                    .delay(300)
                    .duration(100)
                    .style("opacity", 1);
                })
                .on("mouseout", function(d: any): void {
                    divTooltip.transition()
                        .duration(100)
                        .style("opacity", 0);
                })
                .on("mousemove", function(d: any): void {
                    divTooltip
                        .style("left", (d3.mouse(this.ownerSVGElement)[0]) - 50 + "px")
                        .style("top", (d3.mouse(this.ownerSVGElement)[1]) + 10 + "px");
                });
        }

        public getSuffix(serie: number): string {
            if (this.chart.options.getValue("tooltip.valueSuffix") != "") {
                return this.chart.options.getValue("tooltip.valueSuffix");
            }
            if (this.chart.series.items[serie].suffix) {
                return this.chart.series.items[serie].suffix;
            }
            return "";
        }

        public getPointFormat(serie: number): string {
            if (this.chart.options.getValue("tooltip.valuePointFormat") != "") {
                return this.chart.options.getValue("tooltip.valuePointFormat");
            }
            if (this.chart.series.items[serie].format) {
                return this.chart.series.items[serie].format;
            }
            return "";
        }
    }
}