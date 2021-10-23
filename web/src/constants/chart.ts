
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