import {ColorHealth} from "./color";
import * as echarts from 'echarts';

export const LineChartStyles = [
    {
        itemStyle: {
            normal: {
                color: 'rgb(0,130,252)',
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(0,130,252)'
                }, {
                    offset: 1,
                    color: 'rgb(255,255,255)'
                }])
            }
        }
    },
    {
        itemStyle: {
            normal: {
                color: 'rgb(253,216,69)',
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(253,216,69)'
                }, {
                    offset: 1,
                    color: 'rgb(255,255,255)'
                }])
            }
        }
    },
    {
        itemStyle: {
            normal: {
                color: 'rgb(34,237,124)',
            }
        },
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(34,237,124)'
                }, {
                    offset: 1,
                    color: 'rgb(255,255,255)'
                }])
            }
        }
    }
]

export const DefaultHistoryDataOption = {
    title: {
        text: ''
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: []
    },
    toolbox: {},
    grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        containLabel: true,
        borderWidth: '0',
    },
    xAxis: [
        {
            type: 'category',
            boundaryGap: false,
            data: []
        }
    ],
    dataZoom: [
        {
            type: 'inside',
            start: 80,
            end: 100
        },
        {
            start: 80,
            end: 100
        }
    ],
    yAxis: [
        {
            type: 'value'
        }
    ],
    series: []
}

export const DefaultMonitorDataOption = {
    title: {
        text: '',
        textStyle: {
            fontSize: 12
        }
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        type: "plain",
        show: false,
    },
    toolbox: {},
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        borderWidth: '0',
    },
    xAxis: [
        {
            type: 'category',
            boundaryGap: false,
            data: []
        }
    ],
    yAxis: [
        {
            type: 'value',
            axisLine: {
                show: false
            },
            splitLine: {
                show: false
            }
        }
    ],
    series: []
}

export const DefaultMultiBarOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {
        data: ["提示", "重要", "紧急"]
    },
    grid: {
        left: '8%',
        top: '20%',
        right: '3%',
        bottom: '16%',
    },
    xAxis: [{
        type: 'category',
        axisTick: {show: false},
        data: []
    }],
    yAxis: [
        {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
        }
    ],
    series: []
}

export const DefaultPieOption = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
        show: true,
        bottom: 0,
        right: 0,
    },
    series: [
        {
            type: 'pie',
            radius: ['70%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: false,
                    fontSize: '10',
                    fontWeight: 'bold'
                }
            },
            data: []
        }
    ]
}

export const DefaultGaugeOption =  {
    series: [
        {
            name: 'Pressure',
            type: 'gauge',
            progress: {
                show: true
            },
            pointer:{
                show:false//是否显示指针
            },
            itemStyle: {
                color: ColorHealth
            },
            detail: {
                fontSize: 28,
                valueAnimation: true,
                offsetCenter: [0, 0],
                formatter: '{value}%'
            },
            axisTick:false,
            axisLabel:false,
            splitLine: {
                show: false
            },
            data: [
                {
                    value: 50,
                }
            ],
            label: {
                show: true
            }
        }
    ]
}