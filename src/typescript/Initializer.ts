/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Initializer {
        protected _data: any;

        constructor (data: any) {
            this._data = data;
        }

        public getValue(propStr: string, defaultValue?: string): any {
            var parts = propStr.split(".");
            var cur = this._data;
            for (var i = 0; i < parts.length; i++) {
                if (!cur[parts[i]]) {
                    if (defaultValue) {
                        return defaultValue;
                    }
                    return "";
                }
                cur = cur[parts[i]];
            }
            return cur;
        }
    }

    export class Options extends Initializer {
        public canvas: CanvasOptions;
        public columnchart: IColumnChartOptions;
        public xAxes: AxisOptions[] = [];
        public yAxes: AxisOptions[] = [];
        public title: TitleAreaOptions;
        public legend: LegendAreaOptions;
        public linechart: LineChartOptions;
        public piechart: PieChartOptions;
        public plotArea: PlotAreaOptions;
        public series: SeriesOptions;

        constructor(settings: IOptions) {
            super(settings);

            this.canvas = new CanvasOptions(this.getValue("canvas"));
            this.columnchart = new ColumnChartOptions(this.getValue("columnchart"));
            this.title = new TitleAreaOptions(this.getValue("title"));
            this.legend = new LegendAreaOptions(this.getValue("legend"));
            this.xAxes = this._setAxesSettings(this.getValue("xAxis"));
            this.yAxes = this._setAxesSettings(this.getValue("yAxis"));
            this.linechart = new LineChartOptions(this.getValue("linechart"));
            this.piechart = new PieChartOptions(this.getValue("piechart"));
            this.plotArea = new PlotAreaOptions(this.getValue("plotArea"));
            this.series = new SeriesOptions(this.getValue("series"));
        }

        // TODO - refactor - make more generic
        private _setAxesSettings(settings: any): AxisOptions[] {
            var array: AxisOptions[] = [];

            if (settings instanceof Array) {
                for (var i = 0; i < settings.length; i++) {
                    array.push(new AxisOptions(settings[i]));
                }
            }
            else {
                array.push(new AxisOptions(settings));
            }
            return array;
        }
    }

    export class AxisOptions implements IAxisOptions {
        public labels: {
            format: string;
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

        constructor(settings: IAxisOptions) {
            // defaults
            this.gridlines = "none";
            this.labels = {
                format: "",
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
            if (typeof settings.gridlines != "undefined") {
                this.gridlines = settings.gridlines;
            }

            if (typeof settings.labels != "undefined") {
                if (typeof settings.labels.format != "undefined") {
                    this.labels.format = settings.labels.format;
                }
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

    export class Data extends Initializer implements IData {
        public categories: {
            format: string,
            data: any[]
        };
        public series: {
            items: Serie[];
        };

        constructor(data: IData) {
            super(data);

            // defaults
            this.categories = {
                format: "%s",
                data: []
            };

            this.series = {
                items: []
            };

            // apply properties from config if available
            if (typeof data.categories != "undefined") {
                if (typeof data.categories.format != "undefined") {
                    this.categories.format = data.categories.format;
                }
                if (typeof data.categories.data != "undefined") {
                    this.categories.data = data.categories.data;
                }
            }

            if (typeof data.series != "undefined") {
                if (typeof data.series.items != "undefined") {
                    this.series.items = data.series.items;
                }
            }
        }
    }

    export class ColumnChartOptions implements IColumnChartOptions {
        constructor(settings: IColumnChartOptions) {

        }
    }

    export class CanvasOptions implements ICanvasOptions {
        public height: number;
        public width: number;

        constructor(settings: ICanvasOptions) {
            // defaults
            this.height = 0;
            this.width = 0;

            // apply properties from config if available
            if (typeof settings.height != "undefined") {
                this.height = settings.height;
            }

            if (typeof settings.width != "undefined") {
                this.width = settings.width;
            }
        }
    }

    export class LegendAreaOptions implements ILegendAreaOptions {
        public height: number;
        public position: string;
        public title: string;
        public width: number;

        constructor(settings: ILegendAreaOptions) {
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

    export class LineChartOptions implements ILineChartOptions {
        public area: {
            visible: boolean,
            opacity: number
        };
        public interpolation: string;
        public markers: {
            visible: boolean,
            size: number,
            type: MarkerType
        };

        constructor(settings: ILineChartOptions) {
            // defaults
            this.area = {
                visible: false,
                opacity: 0.2
            };
            this.interpolation = "linear";
            this.markers = {
                visible: true,
                size: 6,
                type: "mixed"
            };

            // apply properties from config if available
            if (typeof settings.area != "undefined") {
                if (typeof settings.area.visible != "undefined") {
                    this.area.visible = settings.area.visible;
                }
                if (typeof settings.area.opacity != "undefined") {
                    this.area.opacity = settings.area.opacity;
                }
            }

            if (typeof settings.interpolation != "undefined") {
                this.interpolation = settings.interpolation;
            }

            if (typeof settings.markers != "undefined") {
                if (typeof settings.markers.visible != "undefined") {
                    this.markers.visible = settings.markers.visible;
                }
                if (typeof settings.markers.size != "undefined") {
                    this.markers.size = settings.markers.size;
                }
                if (typeof settings.markers.type != "undefined") {
                    this.markers.type = settings.markers.type;
                }
            }
        }
    }

    export class PieChartOptions implements IPieChartOptions {
        public innerRadius: number;

        constructor(settings: IPieChartOptions) {
            // defaults
            this.innerRadius = 1;

            // apply properties from config if available
            if (typeof settings.innerRadius != "undefined") {
                this.innerRadius = settings.innerRadius;
            }
        }
    }

    export class PlotAreaOptions implements IPlotAreaOptions {
        public innerPadding: number;
        public outerPadding: number;
        public padding: number;

        constructor(settings: IPlotAreaOptions) {
            // defaults
            this.innerPadding = 0.2;
            this.outerPadding = 0;
            this.padding = 20;

            // apply properties from config if available
            if (typeof settings.innerPadding != "undefined") {
                this.innerPadding = Number(settings.innerPadding);
            }

            if (typeof settings.outerPadding != "undefined") {
                this.outerPadding = Number(settings.outerPadding);
            }
            if (typeof settings.padding != "undefined") {
                this.padding = settings.padding;
            }
        }
    }

    export class SeriesOptions implements ISeriesOptions {
        public animate: boolean;
        public labels: {
            visible: boolean;
            format: string;
            rotate: boolean;
        };

        constructor(settings: ISeriesOptions) {
            // defaults
            this.animate = true;
            this.labels = {
                visible: false,
                format: "",
                rotate: false
            };

            // apply properties from config if available
            if (typeof settings.animate != "undefined") {
                this.animate = settings.animate;
            }

            if (typeof settings.labels != "undefined") {
                if (typeof settings.labels.visible != "undefined") {
                    this.labels.visible = settings.labels.visible;
                }
                if (typeof settings.labels.format != "undefined") {
                    this.labels.format = settings.labels.format;
                }
                if (typeof settings.labels.rotate != "undefined") {
                    this.labels.rotate = settings.labels.rotate;
                }
            }
        }
    }

    export class TitleAreaOptions implements ITitleAreaOptions {
        public align: string;
        public height: number;
        public margin: number;
        public subtitle: string;
        public text: string;

        constructor(settings: ITitleAreaOptions) {
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
}