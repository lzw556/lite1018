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
      left: '3%',
      top: '15%',
      right: '3%',
      bottom: '10%',
    },
    xAxis: [{
        type: 'category',
        axisTick: { show: false },
        data: []
    }],
    yAxis: [
        {
            type: 'value'
        }
    ],
    series: []
}

export const DefaultPieOption = {
    graphic: {
        type: "text",
        left: "center",
        top: "35%",
        style: {
            text: "正常率",
        }
    },
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
            radius: ['40%', '70%'],
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
            labelLine: {
                show: false
            },
            data: [
            ]
        }
    ]
}