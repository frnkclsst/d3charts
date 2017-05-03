"use strict";

import { Canvas } from "./Canvas";
import { Categories } from "./Categories";
import { ColorPalette } from "./ColorPalette";
import { StackType } from "./Enums";
import { Data, Options } from "./Initializer";
import { Series } from "./Series";
import { Tooltip } from "./Tooltip";
import { IData, IOptions } from "./IOptions";

export class Chart {
    public canvas: Canvas;
    public categories: Categories;
    public colorPalette: ColorPalette;
    public data: Data;
    public series: Series;
    public options: Options;
    public selector: string;
    public stackType: StackType;
    public tooltip: Tooltip;

    constructor(selector: string, data: IData, options?: IOptions) {
        this.selector = selector;
        this.stackType = StackType.None;

        try {
            // Selector cannot be found
            if (d3.select(this.selector).empty()) {
                throw Error(">> ERR: Selector '" + this.selector + "' not available");
            }

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

            // Redraw EventListener
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