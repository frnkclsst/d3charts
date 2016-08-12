/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class ComboChart extends XYChart {
        public args: any;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.args = args;
        }

        public draw(): void {
            super.draw();
        }
    }
}