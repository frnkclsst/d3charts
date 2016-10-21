/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class ScatterChart extends XYChart {

        private svgLabels: D3.Selection;
        private svgSeries: D3.Selection;

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
        }

        public draw(): void {
            super.draw();

            this.svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            for (var serie = 1; serie < this.series.length; serie++) {
                var _self = this;
                var svgSerie = this.svgSeries.append("g")
                    .attr("id", "serie-" + (serie - 1))
                    .selectAll("path")
                    .data(this.series.getMatrixItem(0))
                    .enter();

                var svgBubbles = svgSerie.append("path")
                    .each(function(d: any, i: number): void {
                        d3.select(this)
                            .attr({
                                "class": "bubble",
                                "d": d3.svg.symbol()
                                    .size(0)
                                    .type(_self.series.items[serie - 1].marker)(),
                                "fill": _self.colorPalette.color(serie - 1),
                                "stroke": _self.colorPalette.color(serie - 1),
                                "stroke-width": 0,
                                "transform": "translate(" + _self.getXCoordinate(d, i, 0) + ", " + _self.getYCoordinate(d, i, serie) + ")"
                            });
                    });

                // add animation
                var count = 0;
                svgBubbles
                    .each((): void => {
                        count++; // count number of bars
                    })
                    .transition()
                    .duration(this.options.plotArea.animation.duration)
                    .ease(this.options.plotArea.animation.ease)
                    .attr("d", (d: any, i: number): any => {
                        var size = _self.series.items[serie].size != undefined ? _self.series.items[serie].size[i] * 10 : 60;
                        return d3.svg.symbol()
                            .size(size)
                            .type(_self.series.items[serie - 1].marker)();
                    })
                    .each("end", (): void => {
                        count--;
                        if (this.options.series.labels.visible === true && !count) { // only draw labels after all transitions ended
                            this.drawLabels(serie - 1);
                        }
                    });

                // draw tooltip
                this.tooltip.draw(svgBubbles, serie);
            }
        }

        public drawLabels(serie: number): void {
            this.svgLabels = this.svgSeries.append("g")
                .attr("id", "labels-" + (serie - 1))
                .attr("opacity", "1");

            d3.selectAll("g#serie-" + (serie - 1)).selectAll("path.bubble")
                .each((d: any, i: number): void => {
                    var rotation = 0;
                    var x = this.getXCoordinate(d, i, serie);
                    var y = this.getYCoordinate(d, i, serie);
                    var dx = 0;
                    var dy = 0;

                    if (this.options.series.labels.rotate === true) {
                        rotation = -90;
                    }

                    var text = this.svgLabels.append("text")
                        .text(d3.format(this.series.items[serie].format)(d.y))
                        .style("text-anchor", "middle")
                        .attr({
                            "alignment-baseline": "central",
                            "class": "label",
                            "fill": "#fff",
                            "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                        });

                    text
                        .attr("dy", dy)
                        .attr("dx", dx);
                });
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            return axis.scale(d.y);
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var data = this.series.getMatrixItem(serie);
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            return axis.scale(data[i].y);
        }

        public getXScale(axis: Axis): any {
            var min = this.series.items[0].min;
            var max = this.series.items[0].max;
            var start = this.canvas.plotArea.axisSize.left;
            var end =  this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

            axis.setScaleType(ScaleType.Linear);
            return d3.scale.linear()
                .domain([min < 0 ? min : 0, max])
                .nice() // adds additional ticks to add some whitespace
                .range([start, end]);
        }

        public getYScale(axis: Axis): any {
            var min = this.series.getMinValue(axis.name);
            var max = this.series.getMaxValue(axis.name);

            var start = this.canvas.plotArea.axisSize.top;
            var end = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

            axis.setScaleType(ScaleType.Linear);
            return d3.scale.linear()
                .domain([max, min < 0 ? min : 0])
                .nice() // adds additional ticks to add some whitespace
                .range([start, end]);
        }
    }
}