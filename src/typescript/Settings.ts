/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Settings {
        public canvas: CanvasSettings;
        public xAxes: AxisSettings[] = [];
        public yAxes: AxisSettings[] = [];
        public title: TitleAreaSettings;
        public legend: LegendAreaSettings;
        public plotOptions: PlotOptions;

        private _settings: ISettings;

        constructor(settings: ISettings, chart: Chart) {
            this._settings = settings;

            this.canvas = new CanvasSettings(this.getValue("canvas"));
            this.title = new TitleAreaSettings(this.getValue("title"));
            this.legend = new LegendArea(this.getValue("legend"), chart);
            this.xAxes = this._setAxesSettings(this.getValue("xAxis"));
            this.yAxes = this._setAxesSettings(this.getValue("yAxis"));
            this.plotOptions = new PlotOptions(this.getValue("plotOptions.general"), chart);
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

        // TODO - Refactor - make more generic
        private _setAxesSettings(settings: any): AxisSettings[] {
            var array: AxisSettings[] = [];

            if (settings instanceof Array) {
                for (var i = 0; i < settings.length; i++) {
                    array.push(new AxisSettings(settings[i]));
                }
            }
            else {
                array.push(new AxisSettings(settings));
            }
            return array;
        }
    }

    export class AxisSettings implements IAxisSettings {
        public tickmarks: string;
        public labels: {
            rotate: number;
        };
        public name: string;
        public orient: OrientationType;
        public gridlines: string;
        public title: {
            text: string;
        };

        constructor(settings: IAxisSettings) {
            // defaults
            this.labels = {
                rotate: 0
            };
            this.name = "";
            this.orient = "";
            this.gridlines = "none";
            this.tickmarks = "no";
            this.title = {
                text: ""
            };

            // apply properties from config if available
            if (settings.tickmarks) {
                this.tickmarks = settings.tickmarks == "yes" ? "yes" : "no";
            }

            if (settings.name) {
                this.name = settings.name;
            }

            if (settings.orient) {
                this.orient = settings.orient;
            }

            if (settings.gridlines) {
                this.gridlines = settings.gridlines;
            }

            if (settings.labels) {
                if (settings.labels.rotate) {
                    this.labels.rotate = settings.labels.rotate;
                }
            }

            if (settings.title) {
                if (settings.title.text) {
                    this.title.text = settings.title.text;
                }
            }
        }
    }

    export class CanvasSettings implements ICanvasSettings {
        public height: number;
        public padding: number;
        public width: number;

        constructor(settings: ICanvasSettings) {
            // defaults
            this.height = 0;
            this.padding = 50;
            this.width = 0;

            // apply properties from config if available
            if (settings.height) {
                this.height = settings.height;
            }
            if (settings.padding) {
                this.padding = settings.padding;
            }
            if (settings.width) {
                this.width = settings.width;
            }
        }
    }

    export class LegendAreaSettings implements ILegendAreaSettings {
        public height: number;
        public position: string;
        public title: string;
        public width: number;

        constructor(settings: ILegendAreaSettings) {
            // defaults
            this.height = 0;
            this.position = "right";
            this.title = "";
            this.width = 0;

            // apply properties from config if available
            if (settings.height) {
                this.height = settings.height;
            }

            if (settings.position) {
                this.position = settings.position;
            }

            if (settings.title) {
                this.title = settings.title;
            }

            if (settings.width) {
                this.width = settings.width;
            }
        }
    }

    export class PlotAreaSettings implements IPlotAreaSettings {
        public height: number;
        public width: number;
        public padding: number;

        constructor(settings: IPlotAreaSettings) {

        }
    }

    export class TitleAreaSettings implements ITitleAreaSettings {
        public align: string;
        public height: number;
        public margin: number;
        public subtitle: string;
        public text: string;

        constructor(settings: ITitleAreaSettings) {
            // defaults
            this.align = "left";
            this.margin = 15;
            this.height = 0;
            this.subtitle = "";
            this.text = "";

            // apply properties from config if available
            if (settings.align) {
                this.align = settings.align;
            }

            if (settings.margin) {
                this.margin = settings.margin;
            }

            if (settings.height) {
                this.height = settings.height;
            }
            if (settings.subtitle) {
                this.subtitle = settings.subtitle;
            }

            if (settings.text) {
                this.text = settings.text;
            }
        }
    }

    export class PlotOptions {
        public innerPadding: number;
        public outerPadding: number;

        constructor(settings: any, chart: Chart) {

            this.innerPadding = 0.5;
            this.outerPadding = 0;

            if (settings.innerPadding) {
                this.innerPadding = Number(settings.innerPadding);
            }

            if (settings.outerPadding) {
                this.outerPadding = Number(settings.outerPadding);
            }
        }
    }
}