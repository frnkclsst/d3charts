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
        public stackType: StackType;
        public tooltip: Tooltip;

        constructor(args: any, selector: string) {
            this.selector = selector;
            this.stackType = StackType.None;

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
            this.categories = new Categories(this);
            this.series = new Series(this);
            this.tooltip = new Tooltip(this, this.selector);

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
    }
}