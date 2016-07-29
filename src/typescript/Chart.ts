/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Chart {
        public canvas: Canvas;
        public categories: Categories;
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
            this.categories = new Categories(this); // this.settings.getValue("categories");
            this.series = new Series(this);

            // update size and add EventListener
            this.canvas.updateCanvasSize();
            d3.select(window).on("resize", (): void => {
                d3.select(this.selector).selectAll("*").remove();
                this.draw();
            });
        }

        public draw(): void {
            this.canvas.draw();
        }

        public drawTooltip(svg: D3.Selection, serie: number): void {
            var _self = this;

            var div = d3.select(_self.selector).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.on("mouseover", function (d: any, i: number): void {
                div.html("<div class='title'>" + _self.settings.getValue("tooltip.title") + "</div>" +
                    "<div class='subtitle'>" + _self.categories.getLabel(i) + "</div><br/>" +
                    "<div class='color' style='width:24px; height: 11px; background-color:" + _self.series.getColor(serie) + "'></div>" +
                    "<div class='serie'>" + _self.series.getLabel(serie) + "</div>" +
                    "<div class='percent'>" + Math.round(d.perc * 100) + "%</div>" +
                    "<div class='value'>" + d.y + _self.settings.getValue("tooltip.valueSuffix") + "</div>"
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
                    div
                        .style("left", (d3.mouse(this)[0]) + (_self.canvas.plotArea.padding - 50) + "px")
                        .style("top", (d3.mouse(this)[1]) + (60 + _self.canvas.plotArea.padding) + "px");  // TODO - hardcoded value only works in some occasions
                });
        }
    }
}