/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Chart {
        public canvas: Canvas;
        public categories: Categories;
        public series: Series;
        public settings: Settings;
        public selector: string;
        public stackType: StackType;
        public tooltip: Tooltip;

        constructor(args: ISettings, selector: string) {
            this.selector = selector;
            this.stackType = StackType.None;

            try {
                // Selector cannot be found
                if (d3.select(this.selector).empty()) {
                    throw Error(">> ERR: Selector '" + this.selector + "' not available");
                }

                // load settings
                this.settings = new Settings(args);

                // initialize chart
                this.canvas = new Canvas(this);
                this.categories = new Categories(this);
                this.series = new Series(this);
                this.tooltip = new Tooltip(this);

                // update size
                this.canvas.updateSize();

                // add EventListener
                d3.select(window).on("resize", (): void => {
                    d3.select(this.selector).selectAll("*").remove();
                    this.draw();
                });
            }
            catch (e) {
                console.log(e.message);
            }
        }

        public draw(): void {
            this.canvas.draw();
        }
    }
}