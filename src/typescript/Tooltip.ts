/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Tooltip {

        public selector: string;
        public chart: Chart;

        constructor(chart: Chart, selector: string) {
            this.chart = chart;
            this.selector = selector;
        }

        public draw(svg: D3.Selection, serie: number): void {
            var _self = this;

            var div = d3.select(_self.selector).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.on("mouseover", function (d: any, i: number): void {
                    div.html("<div class='title'>" + _self.chart.settings.getValue("tooltip.title") + "</div>" +
                        "<div class='subtitle'>" + _self.chart.categories.getLabel(i) + "</div><br/>" +
                        "<div class='color' style='width:24px; height: 11px; background-color:" + _self.chart.series.getColor(serie) + "'></div>" +
                        "<div class='serie'>" + _self.chart.series.getLabel(serie) + "</div>" +
                        "<div class='percent'>" + Math.round(d.perc * 100) + "%</div>" +
                        "<div class='value'>" + d.y + _self.chart.settings.getValue("tooltip.valueSuffix") + "</div>"
                    );

                    div.transition()
                        .delay(300)
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mouseout", function(d: any): void {
                    div.transition()
                        .duration(100)
                        .style("opacity", 0);
                })
                .on("mousemove", function(d: any): void {
                    console.log(d3.mouse(this));
                    div
                        .style("left", (d3.mouse(this.ownerSVGElement)[0]) - 50 + "px")
                        .style("top", (d3.mouse(this.ownerSVGElement)[1]) + 10 + "px");
                });
        }
    }
}