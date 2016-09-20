/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Settings {
        public canvas: CanvasSettings;
        public columnchart: IColumnChartSettings;
        public xAxes: AxisSettings[] = [];
        public yAxes: AxisSettings[] = [];
        public title: TitleAreaSettings;
        public legend: LegendAreaSettings;
        public linechart: LineChartSettings;
        public piechart: PieChartSettings;
        public plotOptions: PlotOptionSettings;
        public series: SeriesSettings;

        private _settings: ISettings;

        constructor(settings: ISettings) {
            this._settings = settings;

            this.canvas = new CanvasSettings(this.getValue("canvas"));
            this.columnchart = new ColumnChartSettings(this.getValue("columnchart"));
            this.title = new TitleAreaSettings(this.getValue("title"));
            this.legend = new LegendAreaSettings(this.getValue("legend"));
            this.xAxes = this._setAxesSettings(this.getValue("xAxis"));
            this.yAxes = this._setAxesSettings(this.getValue("yAxis"));
            this.series = new SeriesSettings(this.getValue("series"));
            this.linechart = new LineChartSettings(this.getValue("linechart"));
            this.piechart = new PieChartSettings(this.getValue("piechart"));
            this.plotOptions = new PlotOptionSettings(this.getValue("plotOptions.general"));
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
        public format: string;
        public labels: {
            rotate: number;
        };
        public name: string;
        public orient: OrientationType;
        public gridlines: string;
        public tickmarks: boolean;
        public title: {
            align: string;
            text: string;
            valign: string;
        };

        constructor(settings: IAxisSettings) {
            // defaults
            this.format = "";
            this.gridlines = "none";
            this.labels = {
                rotate: 0
            };
            this.name = "";
            this.orient = "";
            this.tickmarks = false;
            this.title = {
                align: "center",
                text: "",
                valign: "middle"
            };

            // apply properties from config if available
            if (typeof settings.format != "undefined") {
                this.format = settings.format;
            }

            if (typeof settings.gridlines != "undefined") {
                this.gridlines = settings.gridlines;
            }

            if (typeof settings.labels != "undefined") {
                if (typeof settings.labels.rotate != "undefined") {
                    this.labels.rotate = settings.labels.rotate;
                }
            }

            if (typeof settings.name != "undefined") {
                this.name = settings.name;
            }

            if (typeof settings.orient != "undefined") {
                this.orient = settings.orient;
            }

            if (typeof settings.tickmarks != "undefined") {
                this.tickmarks = settings.tickmarks;
            }

            if (typeof settings.title != "undefined") {
                if (typeof settings.title.align != "undefined") {
                    this.title.align = settings.title.align;
                }
                if (typeof settings.title.text != "undefined") {
                    this.title.text = settings.title.text;
                }
                if (typeof settings.title.valign != "undefined") {
                    this.title.valign = settings.title.valign;
                }
            }
        }
    }

    export class ColumnChartSettings implements IColumnChartSettings {
        constructor(settings: IColumnChartSettings) {

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
            if (typeof settings.height != "undefined") {
                this.height = settings.height;
            }

            if (typeof settings.padding != "undefined") {
                this.padding = settings.padding;
            }

            if (typeof settings.width != "undefined") {
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
            if (typeof settings.height != "undefined") {
                this.height = settings.height;
            }

            if (typeof settings.position != "undefined") {
                this.position = settings.position;
            }

            if (typeof settings.title != "undefined") {
                this.title = settings.title;
            }

            if (typeof settings.width != "undefined") {
                this.width = settings.width;
            }
        }
    }

    export class LineChartSettings implements ILineChartSettings {
        public fillArea: boolean;
        public interpolation: string;
        public showMarkers: boolean;

        constructor(settings: ILineChartSettings) {
            // defaults
            this.fillArea = false;
            this.interpolation = "linear";
            this.showMarkers = true;

            // apply properties from config if available
            if (typeof settings.fillArea != "undefined") {
                this.fillArea = settings.fillArea;
            }

            if (typeof settings.interpolation != "undefined") {
                this.interpolation = settings.interpolation;
            }

            if (typeof settings.showMarkers != "undefined") {
                this.showMarkers = settings.showMarkers;
            }
        }
    }

    export class PieChartSettings implements IPieChartSettings {
        public innerRadius: number;

        constructor(settings: IPieChartSettings) {
            this.innerRadius = 1;

            if (typeof settings.innerRadius != "undefined") {
                this.innerRadius = settings.innerRadius;
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

    export class SeriesSettings implements ISeriesSettings {
        public data: Serie[];
        public showLabels: boolean;
        public animate: boolean;

        constructor(settings: ISeriesSettings) {
            // defaults
            this.animate = true;
            this.data = [];
            this.showLabels = false;

            // apply properties from config if available
            if (typeof settings.animate != "undefined") {
                this.animate = settings.animate;
            }

            if (typeof settings.data != "undefined") {
                this.data = settings.data;
            }

            if (typeof settings.showLabels != "undefined") {
                this.showLabels = settings.showLabels;
            }
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
            if (typeof settings.align != "undefined") {
                this.align = settings.align;
            }

            if (typeof settings.margin != "undefined") {
                this.margin = settings.margin;
            }

            if (typeof settings.height != "undefined") {
                this.height = settings.height;
            }
            if (typeof settings.subtitle != "undefined") {
                this.subtitle = settings.subtitle;
            }

            if (typeof settings.text != "undefined") {
                this.text = settings.text;
            }
        }
    }

    export class PlotOptionSettings implements IPlotOptionSettings {
        public innerPadding: number;
        public outerPadding: number;

        constructor(settings: any) {
            // defaults
            this.innerPadding = 0.5;
            this.outerPadding = 0;

            // apply properties from config if available
            if (typeof settings.innerPadding != "undefined") {
                this.innerPadding = Number(settings.innerPadding);
            }

            if (typeof settings.outerPadding != "undefined") {
                this.outerPadding = Number(settings.outerPadding);
            }
        }
    }
}