/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class PlotArea implements IArea {
        public height: number;
        public width: number;
        public svg: D3.Selection;
        public padding: number;

        private _settings: ISettings;

        constructor(settings: any) {
            this._settings = settings;

            this.padding = settings.canvas.padding;
            this.height = settings.canvas.height - settings.title.height - this.padding * 2;
            this.width = settings.canvas.width - this.padding * 2 - settings.legend.width;
        }

        public draw(): void {
            // initialize
            this.height = this._settings.canvas.height - this._settings.title.height - this.padding * 2;
            this.width = this._settings.canvas.width - this.padding * 2 - this._settings.legend.width;

            // draw plot area
            this.svg = this._settings.canvas.svg.append("g")
                .attr("class", "plotarea")
                .attr("transform", "translate(" + this.padding + ","
                    + (this._settings.title.height
                    + this.padding) + ")");
        }
    }
}