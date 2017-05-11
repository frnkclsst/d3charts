import { LineChart } from "./typescript/LineChart";
import { ColumnChart } from "./typescript/ColumnChart";
import { ComboChart } from "./typescript/ComboChart";
import { StackedColumnChart } from "./typescript/StackedColumnChart";
import { StackedPercentColumnChart } from "./typescript/StackedPercentColumnChart";
import { BarChart } from "./typescript/BarChart";
import { StackedBarChart } from "./typescript/StackedBarChart";
import { StackedPercentBarChart } from "./typescript/StackedPercentBarChart";
import { StackedLineChart } from "./typescript/StackedLineChart";
import { StackedPercentLineChart } from "./typescript/StackedPercentLineChart";
import { ScatterChart } from "./typescript/ScatterChart";
import { PieChart } from "./typescript/PieChart";
import { IOptions } from "./typescript/IOptions";

// jQuery declaration
declare const $: { get: (url: string, response: (rawData: string) => void) => void };

const options: IOptions = {
    plotOptions: {
        animation: {
            duration: 500,
            ease: "linear"
        },
        area: {
            visible: true,
            opacity: 0.3
        },
        bands: {
            innerPadding: 0.2,
            outerPadding: 0
        },
        line: {
            interpolation: "cardinal"
        },
        markers: {
            visible: true,
            size: 6,
            type: "circle"
        },
        pie: {
            innerRadius: 0.5
        }
    },
    plotArea: {
        border: {
            bottom: false,
            left: false,
            right: false,
            top: false
        },
        padding: 50
    },
    canvas: {
        border: {
            bottom: true,
            left: true,
            right: true,
            top: true
        }
    },
    titleArea: {
        align: "center",
        border: {
            bottom: true,
            left: false,
            right: false,
            top: false
        },
        height: 50,
        margin: 0,
        position: "top",
        subtitle: "Source: wikipedia.org",
        text: "Rainfall vs Temperature"
    },
    legendArea: {
        border: {
            bottom: false,
            left: false,
            right: true,
            top: false
        },
        title: "Rainfall vs Temperature",
        position: "left",
        width: 200,
        height: 200
    },
    xAxis: [{
        gridlines: "none",
        labels: {
            rotate: -45
        },
        orient: "bottom",
        tickmarks: true,
        title: {
            align: "center",
            text: "Month"
        }
    }],
    yAxis: [{
        name: "Rainfall",
        gridlines: "major",
        labels: {
            rotate: 0
        },
        orient: "left",
        tickmarks: true,
        title: {
            text: "",
            valign: "middle"
        }
    },
    {
        name: "Temperature",
        gridlines: "none",
        labels: {
            rotate: 0
        },
        orient: "right",
        tickmarks: true,
        title: {
            text: "",
            valign: "middle"
        }
    }],
    series: {
        labels: {
            visible: true,
            format: ".4f",
            rotate: false
        },
        1: {
            format: ".2f"
        },
        2: {
            format: ".2f"
        },
        3: {
            format: ".1f"
        }
    },
    tooltip: {
        title: "Rainfall vs Temperature"
    }
};

//const url = "data/empty.txt";
const url = "data/multiple-axes.txt";
//const url = "data/scatterplot.txt";
//const url = "data/Actuals-vs-Budget.txt";
//const url = "data/area-basic-1serie-ordinal.txt";
//const url = "data/area-basic-nserie-ordinal.txt";
//const url = "data/area-negative-1serie-ordinal.txt";
//const url = "data/area-negative-nserie-ordinal.txt";
//const url = "data/area-negative-inverted-1serie-ordinal.txt";
//const url = "data/area-negative-inverted-nserie-ordinal.txt";
//const url = "data/settings-time-1.txt";
//const url = "data/settings-time-2.txt";
//const url = "data/settings-time-3.txt";

$.get(url, function (rawData: string): void {

    // Initialize
    const data = JSON.parse(rawData);
    // Draw initial chart
    const chart = new LineChart("#chart", data, options);
    chart.draw();

    document.getElementById("type").onchange = function (this: HTMLSelectElement): void {
        document.getElementById("chart").innerHTML = "";
        const val = this.options[this.selectedIndex].value;
        switch (val) {
            case "column":
                const columnChart = new ColumnChart("#chart", data, options);
                columnChart.draw();
                break;
            case "combo":
                const comboChart = new ComboChart("#chart", data, options);
                comboChart.draw();
                break;
            case "stackedcolumn":
                const stackedColumnChart = new StackedColumnChart("#chart", data, options);
                stackedColumnChart.draw();
                break;
            case "stackedpercentcolumn":
                const stackedPercentColumnChart = new StackedPercentColumnChart("#chart", data, options);
                stackedPercentColumnChart.draw();
                break;
            case "bar":
                const barChart = new BarChart("#chart", data, options);
                barChart.draw();
                break;
            case "stackedbar":
                const stackedBarChart = new StackedBarChart("#chart", data, options);
                stackedBarChart.draw();
                break;
            case "stackedpercentbar":
                const stackedPercentBarChart = new StackedPercentBarChart("#chart", data, options);
                stackedPercentBarChart.draw();
                break;
            case "line":
                const lineChart = new LineChart("#chart", data, options);
                lineChart.draw();
                break;
            case "stackedline":
                const stackedLineChart = new StackedLineChart("#chart", data, options);
                stackedLineChart.draw();
                break;
            case "stackedpercentline":
                const stackedPercentLineChart = new StackedPercentLineChart("#chart", data, options);
                stackedPercentLineChart.draw();
                break;
            case "scatter":
                const scatterChart = new ScatterChart("#chart", data, options);
                scatterChart.draw();
                break;
            case "pie":
                const pieChart = new PieChart("#chart", data, options);
                pieChart.draw();
                break;
        }
    };
});
