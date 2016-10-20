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

        constructor(options: IOptions) {
            super(options);

            this.canvas = new CanvasOptions(this.getValue("canvas"));
            this.columnchart = new ColumnChartOptions(this.getValue("columnchart"));
            this.title = new TitleAreaOptions(this.getValue("title"));
            this.legend = new LegendAreaOptions(this.getValue("legend"));
            this.xAxes = this._setAxesOptions(this.getValue("xAxis"));
            this.yAxes = this._setAxesOptions(this.getValue("yAxis"));
            this.linechart = new LineChartOptions(this.getValue("linechart"));
            this.piechart = new PieChartOptions(this.getValue("piechart"));
            this.plotArea = new PlotAreaOptions(this.getValue("plotArea"));
            this.series = new SeriesOptions(this.getValue("series"));
        }

        // TODO - refactor - make more generic
        private _setAxesOptions(options: any): AxisOptions[] {
            var array: AxisOptions[] = [];

            if (options instanceof Array) {
                for (var i = 0; i < options.length; i++) {
                    array.push(new AxisOptions(options[i]));
                }
            }
            else {
                array.push(new AxisOptions(options));
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

        constructor(options: IAxisOptions) {
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
            if (typeof options.gridlines != "undefined") {
                this.gridlines = options.gridlines;
            }

            if (typeof options.labels != "undefined") {
                if (typeof options.labels.format != "undefined") {
                    this.labels.format = options.labels.format;
                }
                if (typeof options.labels.rotate != "undefined") {
                    this.labels.rotate = options.labels.rotate;
                }
            }

            if (typeof options.name != "undefined") {
                this.name = options.name;
            }

            if (typeof options.orient != "undefined") {
                this.orient = options.orient;
            }

            if (typeof options.tickmarks != "undefined") {
                this.tickmarks = options.tickmarks;
            }

            if (typeof options.title != "undefined") {
                if (typeof options.title.align != "undefined") {
                    this.title.align = options.title.align;
                }
                if (typeof options.title.text != "undefined") {
                    this.title.text = options.title.text;
                }
                if (typeof options.title.valign != "undefined") {
                    this.title.valign = options.title.valign;
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
        constructor(options: IColumnChartOptions) {

        }
    }

    export class CanvasOptions implements ICanvasOptions {
        public height: number;
        public width: number;

        constructor(options: ICanvasOptions) {
            // defaults
            this.height = 0;
            this.width = 0;

            // apply properties from config if available
            if (typeof options.height != "undefined") {
                this.height = options.height;
            }

            if (typeof options.width != "undefined") {
                this.width = options.width;
            }
        }
    }

    export class LegendAreaOptions implements ILegendAreaOptions {
        public height: number;
        public position: string;
        public title: string;
        public width: number;

        constructor(options: ILegendAreaOptions) {
            // defaults
            this.height = 0;
            this.position = "right";
            this.title = "";
            this.width = 0;

            // apply properties from config if available
            if (typeof options.height != "undefined") {
                this.height = options.height;
            }

            if (typeof options.position != "undefined") {
                this.position = options.position;
            }

            if (typeof options.title != "undefined") {
                this.title = options.title;
            }

            if (typeof options.width != "undefined") {
                this.width = options.width;
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

        constructor(options: ILineChartOptions) {
            // defaults
            this.area = {
                visible: false,
                opacity: 0.3
            };
            this.interpolation = "linear";
            this.markers = {
                visible: true,
                size: 6,
                type: "mixed"
            };

            // apply properties from config if available
            if (typeof options.area != "undefined") {
                if (typeof options.area.visible != "undefined") {
                    this.area.visible = options.area.visible;
                }
                if (typeof options.area.opacity != "undefined") {
                    this.area.opacity = options.area.opacity;
                }
            }

            if (typeof options.interpolation != "undefined") {
                this.interpolation = options.interpolation;
            }

            if (typeof options.markers != "undefined") {
                if (typeof options.markers.visible != "undefined") {
                    this.markers.visible = options.markers.visible;
                }
                if (typeof options.markers.size != "undefined") {
                    this.markers.size = options.markers.size;
                }
                if (typeof options.markers.type != "undefined") {
                    this.markers.type = options.markers.type;
                }
            }
        }
    }

    export class PieChartOptions implements IPieChartOptions {
        public innerRadius: number;

        constructor(options: IPieChartOptions) {
            // defaults
            this.innerRadius = 1;

            // apply properties from config if available
            if (typeof options.innerRadius != "undefined") {
                this.innerRadius = options.innerRadius;
            }
        }
    }

    export class PlotAreaOptions implements IPlotAreaOptions {
        public innerPadding: number;
        public outerPadding: number;
        public padding: number;

        constructor(options: IPlotAreaOptions) {
            // defaults
            this.innerPadding = 0.2;
            this.outerPadding = 0;
            this.padding = 20;

            // apply properties from config if available
            if (typeof options.innerPadding != "undefined") {
                this.innerPadding = Number(options.innerPadding);
            }

            if (typeof options.outerPadding != "undefined") {
                this.outerPadding = Number(options.outerPadding);
            }
            if (typeof options.padding != "undefined") {
                this.padding = options.padding;
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

        constructor(options: ISeriesOptions) {
            // defaults
            this.animate = true;
            this.labels = {
                visible: false,
                format: "",
                rotate: false
            };

            // apply properties from config if available
            if (typeof options.animate != "undefined") {
                this.animate = options.animate;
            }

            if (typeof options.labels != "undefined") {
                if (typeof options.labels.visible != "undefined") {
                    this.labels.visible = options.labels.visible;
                }
                if (typeof options.labels.format != "undefined") {
                    this.labels.format = options.labels.format;
                }
                if (typeof options.labels.rotate != "undefined") {
                    this.labels.rotate = options.labels.rotate;
                }
            }
        }
    }

    export class TitleAreaOptions implements ITitleAreaOptions {
        public align: string;
        public height: number;
        public margin: number;
        public position: string;
        public subtitle: string;
        public text: string;

        constructor(options: ITitleAreaOptions) {
            // defaults
            this.align = "left";
            this.height = 0;
            this.margin = 15;
            this.position = "top";
            this.subtitle = "";
            this.text = "";

            // apply properties from config if available
            if (typeof options.align != "undefined") {
                this.align = options.align;
            }
            if (typeof options.margin != "undefined") {
                this.margin = options.margin;
            }
            if (typeof options.height != "undefined") {
                this.height = options.height;
            }
            if (typeof options.position != "undefined") {
                this.position = options.position;
            }
            if (typeof options.subtitle != "undefined") {
                this.subtitle = options.subtitle;
            }
            if (typeof options.text != "undefined") {
                this.text = options.text;
            }
        }
    }
}