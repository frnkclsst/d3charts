"use strict";

import { MarkerType, OrientationType } from "./Enums";
import { IAxisOptions, ICanvasOptions, IData, ILegendAreaOptions, IOptions, IPlotAreaOptions, IPlotOptions, ISeriesOptions, ITitleAreaOptions } from "./IOptions";
import { Serie } from "./Serie";

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

export class Options extends Initializer implements IOptions {
    public canvas: CanvasOptions;
    public legend: LegendAreaOptions;
    public plotArea: PlotAreaOptions;
    public plotOptions: PlotOptions;
    public series: SeriesOptions;
    public title: TitleAreaOptions;
    public xAxes: AxisOptions[] = [];
    public yAxes: AxisOptions[] = [];

    constructor(options: IOptions) {
        super(options);

        this.canvas = new CanvasOptions(this.getValue("canvas"));
        this.title = new TitleAreaOptions(this.getValue("titleArea"));
        this.legend = new LegendAreaOptions(this.getValue("legendArea"));
        this.xAxes = this._setAxesOptions(this.getValue("xAxis"));
        this.yAxes = this._setAxesOptions(this.getValue("yAxis"));
        this.plotArea = new PlotAreaOptions(this.getValue("plotArea"));
        this.plotOptions = new PlotOptions(this.getValue("plotOptions"));
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
    public series: Serie[];

    constructor(data: IData) {
        super(data);

        // defaults
        this.categories = {
            format: "%s",
            data: []
        };
        this.series = [];

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
            if (typeof data.series != "undefined") {
                this.series = data.series;
            }
        }
    }
}

export class CanvasOptions implements ICanvasOptions {
    public border: {
        bottom: boolean,
        left: boolean,
        right: boolean,
        top: boolean
    };
    public height: number;
    public width: number;

    constructor(options: ICanvasOptions) {
        // defaults
        this.border = {
            bottom: false,
            left: false,
            right: false,
            top: false
        };
        this.height = 0;
        this.width = 0;

        // apply properties from config if available
        if (typeof options.border != "undefined") {
            if (typeof options.border.bottom != "undefined") {
                this.border.bottom = options.border.bottom;
            }
            if (typeof options.border.left != "undefined") {
                this.border.left = options.border.left;
            }
            if (typeof options.border.right != "undefined") {
                this.border.right = options.border.right;
            }
            if (typeof options.border.top != "undefined") {
                this.border.top = options.border.top;
            }
        }
        if (typeof options.height != "undefined") {
            this.height = options.height;
        }

        if (typeof options.width != "undefined") {
            this.width = options.width;
        }
    }
}

export class LegendAreaOptions implements ILegendAreaOptions {
    public border: {
        bottom: boolean,
        left: boolean,
        right: boolean,
        top: boolean
    };
    public height: number;
    public position: string;
    public title: string;
    public width: number;

    constructor(options: ILegendAreaOptions) {
        // defaults
        this.border = {
            bottom: false,
            left: false,
            right: false,
            top: false
        };
        this.height = 0;
        this.position = "right";
        this.title = "";
        this.width = 0;

        // apply properties from config if available
        if (typeof options.border != "undefined") {
            if (typeof options.border.bottom != "undefined") {
                this.border.bottom = options.border.bottom;
            }
            if (typeof options.border.left != "undefined") {
                this.border.left = options.border.left;
            }
            if (typeof options.border.right != "undefined") {
                this.border.right = options.border.right;
            }
            if (typeof options.border.top != "undefined") {
                this.border.top = options.border.top;
            }
        }
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

export class PlotAreaOptions implements IPlotAreaOptions {
    public border: {
        bottom: boolean,
        left: boolean,
        right: boolean,
        top: boolean
    };
    public padding: number;

    constructor(options: IPlotAreaOptions) {
        // defaults
        this.border = {
            bottom: false,
            left: false,
            right: false,
            top: false
        };
        this.padding = 20;

        // apply properties from config if available
        if (typeof options.border != "undefined") {
            if (typeof options.border.bottom != "undefined") {
                this.border.bottom = options.border.bottom;
            }
            if (typeof options.border.left != "undefined") {
                this.border.left = options.border.left;
            }
            if (typeof options.border.right != "undefined") {
                this.border.right = options.border.right;
            }
            if (typeof options.border.top != "undefined") {
                this.border.top = options.border.top;
            }
        }
        if (typeof options.padding != "undefined") {
            this.padding = options.padding;
        }
    }
}

export class PlotOptions implements IPlotOptions {
    public animation: {
        duration: number;
        ease: string;
    };
    public area: {
        visible: boolean,
        opacity: number
    };
    public bands: {
        innerPadding: number;
        outerPadding: number;
    };
    public colors: string[];
    public markers: {
        visible: boolean,
        size: number,
        type: MarkerType
    };
    public line: {
        interpolation: string;
    };
    public pie: {
        innerRadius: number;
    };

    constructor(options: IPlotOptions) {
        // defaults
        this.animation = {
            duration: 1000,
            ease: "linear"
        };
        this.area = {
          visible: false,
          opacity: 0.4
        };
        this.bands = {
            innerPadding: 0.5,
            outerPadding: 0.5
        };
        this.colors = [
            "#5491F6", //  1
            "#7AC124", //  2
            "#FFA300", //  3
            "#129793", //  4
            "#F16A73", //  5
            "#1B487F", //  6
            "#FF6409", //  7
            "#CC0000", //  8
            "#8E44AD", //  9
            "#936A4A", // 10
            "#2C5195", // 11
            "#4B7717", // 12
            "#D58A02", // 13
            "#005D5D", // 14
            "#BD535B", // 15
            "#123463", // 16
            "#980101", // 17
            "#D85402", // 18
            "#622E79", // 19
            "#60452F"  // 20
        ];
        this.line = {
            interpolation: "linear"
        };
        this.markers = {
            visible: true,
            size: 6,
            type: "circle"
        };
        this.pie = {
            innerRadius: 1
        };

        // apply properties from config if available
        if (typeof options.animation != "undefined") {
            if (typeof options.animation.duration) {
                this.animation.duration = options.animation.duration;
            }
            if (typeof options.animation.ease) {
                this.animation.ease = options.animation.ease;
            }
        }
        if (typeof options.area != "undefined") {
            if (typeof options.area.visible != "undefined") {
                this.area.visible = options.area.visible;
            }
            if (typeof options.area.opacity != "undefined") {
                this.area.opacity = options.area.opacity;
            }
        }
        if (typeof options.bands != "undefined") {
            if (typeof options.bands.innerPadding != "undefined") {
                this.bands.innerPadding = Number(options.bands.innerPadding);
            }
            if (typeof options.bands.outerPadding != "undefined") {
                this.bands.outerPadding = Number(options.bands.outerPadding);
            }
        }
        if (typeof options.colors != "undefined") {
            this.colors = options.colors;
        }
        if (typeof options.line != "undefined") {
            if (typeof options.line.interpolation != "undefined") {
                this.line.interpolation = options.line.interpolation;
            }
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
        if (typeof options.pie != "undefined") {
            if (typeof options.pie.innerRadius != "undefined") {
                this.pie.innerRadius = options.pie.innerRadius;
            }
        }
    }
}

export class SeriesOptions implements ISeriesOptions {
    [index: string]: {
        visible?: boolean,
        format: string,
        rotate?: boolean
    };

    public labels: {
        visible: boolean;
        format: string;
        rotate: boolean;
    };

    constructor(options: ISeriesOptions) {
        // defaults
        this.labels = {
            visible: false,
            format: "",
            rotate: false
        };

        // apply properties from config if available
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
    public border: {
        bottom: boolean,
        left: boolean,
        right: boolean,
        top: boolean
    };
    public height: number;
    public margin: number;
    public position: string;
    public subtitle: string;
    public text: string;

    constructor(options: ITitleAreaOptions) {
        // defaults
        this.align = "left";
        this.border = {
            bottom: false,
            left: false,
            right: false,
            top: false
        };
        this.height = 0;
        this.margin = 15;
        this.position = "top";
        this.subtitle = "";
        this.text = "";

        // apply properties from config if available
        if (typeof options.align != "undefined") {
            this.align = options.align;
        }
        if (typeof options.border != "undefined") {
            if (typeof options.border.bottom != "undefined") {
                this.border.bottom = options.border.bottom;
            }
            if (typeof options.border.left != "undefined") {
                this.border.left = options.border.left;
            }
            if (typeof options.border.right != "undefined") {
                this.border.right = options.border.right;
            }
            if (typeof options.border.top != "undefined") {
                this.border.top = options.border.top;
            }
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
