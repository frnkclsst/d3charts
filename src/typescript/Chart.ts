"use strict";

import * as d3 from "d3";
import { Canvas } from "./Canvas";
import { Categories } from "./Categories";
import { ColorPalette } from "./ColorPalette";
import { StackType } from "./Enums";
import { Data, Options } from "./Initializer";
import { Series } from "./Series";
import { Tooltip } from "./Tooltip";
import { IChartData, IOptions } from "./IInterfaces";

export class Chart {
    public canvas: Canvas;
    public categories: Categories;
    public colorPalette: ColorPalette;
    public data: Data;
    public dispatcher: d3.Dispatch;
    public series: Series;
    public options: Options;
    public selector: string;
    public stackType: StackType;
    public tooltip: Tooltip;

    constructor(selector: string, data: IChartData, options?: IOptions) {
        this.selector = selector;
        this.stackType = StackType.None;

        try {
            // Selector cannot be found
            if (d3.select(this.selector).empty()) {
                throw Error(">> ERR: Selector '" + this.selector + "' not available");
            }

            // Register redraw event
            d3.select(window).on("resize", (): void => {
                d3.select(this.selector).selectAll("*").remove();
                this.draw();
            });

            // Register custom events
            this.dispatcher = d3.dispatch("onlegendclick", "rescale");

            // Load settings
            if (options != undefined) {
                this.options = new Options(options);
            }
            else {
                this.options = new Options(<IOptions>{});
            }

            // Load data
            this.data = new Data(data);

            // Initialize chart
            this.canvas = new Canvas(this);
            this.categories = new Categories(this);
            this.colorPalette = new ColorPalette(this);
            this.series = new Series(this);
            this.tooltip = new Tooltip(this);
        }
        catch (e) {
            console.log(e.message);
        }
    }

    public draw(): void {
        this.canvas.draw();
    }

    public hasData(): boolean {
        return (this.series.items[0].data.length > 0 || (this.series.items[0].min.length > 0 && this.series.items[0].max.length > 0));
    }
}
