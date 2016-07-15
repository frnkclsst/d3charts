/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Settings {
        public settings: string;

        constructor(settings: any) {
            this.settings = settings;
        }

        public getValue(propStr: string, defaultValue?: string): any {
            var parts = propStr.split(".");
            var cur = this.settings;
            for (var i = 0; i < parts.length; i++) {
                if (!cur[parts[i]]) {
                    console.log(">> WARN: " + propStr + " not set in settings");
                    if (defaultValue) {
                        console.log(">> WARN: " + propStr + " defaulted to '" + defaultValue + "'");
                        return defaultValue;
                    }
                    return "";
                }
                cur = cur[parts[i]];
            }
            return cur;
        }
    }

    export class PlotOptions {
        public innerPadding: number;
        public outerPadding: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.innerPadding = Number(chart.settings.getValue("plotOptions.general.innerPadding", "0.5"));
            this.outerPadding = Number(chart.settings.getValue("plotOptions.general.outerPadding", "0"));
        }
    }
}