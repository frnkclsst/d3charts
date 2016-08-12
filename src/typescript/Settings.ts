/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Settings {
        public canvas: Canvas;
        public xAxes: XAxis[] = [];
        public yAxes: YAxis[] = [];
        public title: TitleArea;
        public legend: LegendArea;
        public plotArea: PlotArea;

        private _settings: any;

        constructor(settings: ISettings, chart: Chart) {
            this._settings = settings;

            this.canvas = this._setCanvas(this.getValue("canvas"), chart, this);
            this.title = new TitleArea(this.getValue("title"), chart);
            this.legend = new LegendArea(this.getValue("legend"), chart, this);
            this.plotArea = new PlotArea(this);
            this.xAxes = this._setXAxes(this.getValue("xAxis"), chart);
            this.yAxes = this._setYAxes(this.getValue("yAxis"), chart);
        }

        //TODO - Remove function
        public get(args: any, key: string, defaultValue?: string): any {
            var parts = key.split(".");
            var cur = args;
            for (var i = 0; i < parts.length; i++) {
                if (!cur[parts[i]]) {
                    console.log(">> WARN: " + key + " not set in settings");
                    if (defaultValue) {
                        console.log(">> WARN: " + key + " defaulted to '" + defaultValue + "'");
                        return defaultValue;
                    }
                    return "";
                }
                cur = cur[parts[i]];
            }
            return cur;
        }

        public getValue(propStr: string, defaultValue?: string): any {
            var parts = propStr.split(".");
            var cur = this._settings;
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

        private _setCanvas(canvasSettings: any, chart: Chart, settings: Settings): Canvas {
            return this.canvas = new Canvas(canvasSettings, chart, settings);
        }

        private _setXAxes(settings: any, chart: Chart): YAxis[] {
            var array: XAxis[] = [];
            if (settings.length != undefined && settings != "") {
                for (var i = 0; i < settings.length; i++) {
                    array.push(new XAxis(settings[i], chart));
                }
            }
            else {
                array.push(new XAxis(settings, chart));
            }
            return array;
        }

        private _setYAxes(settings: any, chart: Chart): YAxis[] {
            var array: YAxis[] = [];
            if (settings.length != undefined && settings != "") {
                for (var i = 0; i < settings.length; i++) {
                    array.push(new YAxis(settings[i], chart));
                }
            }
            else {
                array.push(new YAxis(settings, chart));
            }
            return array;
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