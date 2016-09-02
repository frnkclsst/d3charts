/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class ComboChart extends XYChart {
        public args: any;

        constructor(settings: ISettings, selector: string) {
            super(settings, selector);
            this.args = settings;
        }

        public draw(): void {
            super.draw();
        }
    }
}