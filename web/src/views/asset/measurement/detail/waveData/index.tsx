import {Col, ConfigProvider, DatePicker, Row, Select, Space, Spin, Table} from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import {
    DownloadMeasurementRawDataRequest,
    GetMeasurementWaveDataRequest,
    GetMeasurementWaveDataTimestampRequest
} from '../../../../../apis/measurement';
import {LineChartStyles} from '../../../../../constants/chart';
import {Measurement} from '../../../../../types/measurement';
import "../../../index.css";
import {EmptyLayout} from "../../../../layout";

const {Option} = Select;

const defaultChartOption = {
    title: {top: 0},
    tooltip: {},
    xAxis: {},
    grid: {
        left: '2%',
        right: '8%',
        bottom: '12%',
        containLabel: true,
        borderWidth: '0',
    },
    yAxis: {type: 'value'},
    series: [],
    animation: false,
    smooth: true,
    dataZoom: [
        {
            type: 'slider',
            show: true,
            startValue: 0,
            endValue: 3000,
            height: '32',
            zoomLock: false
        }
    ]
}

const WaveData: React.FC<{ measurement: Measurement }> = ({measurement}) => {
    const [beginDate, setBeginDate] = React.useState(moment().subtract(3, 'days').startOf('day'));
    const [endDate, setEndDate] = React.useState(moment().endOf('day'));
    const [dataSource, setDataSource] = React.useState<any>();
    const [loading, setLoading] = React.useState(false);
    const [chartOptions, setChartOptions] = React.useState<any>({});
    const [timestamp, setTimestamp] = React.useState<number>();
    const [calculate, setCalculate] = React.useState<string>("accelerationTimeDomain");
    const [envelope, setEnvelope] = React.useState<number>(0);

    React.useEffect(() => {
        GetMeasurementWaveDataTimestampRequest(
            measurement.id,
            beginDate.utc().unix(),
            endDate.utc().unix()
        ).then(data => {
            setDataSource(data)
            setTimestamp(data.length && data[0].timestamp)
        });
    }, [beginDate, endDate, measurement.id]);

    React.useEffect(() => {
        if (timestamp) {
            setLoading(true);
            GetMeasurementWaveDataRequest(measurement.id, timestamp, {calculate}).then(data => {
                    if (calculate.indexOf("TimeDomain") !== -1) {
                        renderTimeDomainChart(data);
                    } else if (calculate.indexOf("FrequencyDomain") !== -1) {
                        renderFrequencyDomainChart(data);
                    } else if (calculate.indexOf("Envelope") !== -1) {
                        renderEnvelopeChart(data);
                    }
                    setLoading(false);
                }
            );
        }
    }, [timestamp, calculate, envelope]);

    const renderEnvelopeChart = (data: any) => {
        const legends = ["X轴", "Y轴", "Z轴"];
        setChartOptions({
            ...defaultChartOption,
            legend: {
                data: [legends[envelope]],
                itemStyle: {
                    color: LineChartStyles[envelope].itemStyle.normal.color
                }
            },
            title: {text: `${getChartTitle()} ${data.frequency / 1000}KHz`, top: 0},
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function (params: any) {
                    let relVal = `<strong>${params[0].name}</strong>&nbsp;Hz`;
                    let value = Number(params[2].value).toFixed(3)
                    relVal += `<br/> ${params[2].marker} ${params[2].seriesName}: ${value}`
                    return relVal;
                }
            },
            xAxis: {
                type: 'category',
                data: data.xAxis[0],
                name: "ms"
            },
            series: [
                {
                    name: legends[envelope],
                    type: 'line',
                    data: data.highEnvelopes![envelope],
                    lineStyle: {
                        opacity: 0
                    },
                    areaStyle: {
                        color: '#ccc'
                    },
                    stack: 'confidence-band',
                    symbol: 'none'
                },
                {
                    name: legends[envelope],
                    type: 'line',
                    data: data.lowEnvelopes![envelope],
                    lineStyle: {
                        opacity: 0
                    },
                    areaStyle: {
                        color: '#ccc'
                    },
                    stack: 'confidence-band',
                    symbol: 'none'
                },
                {
                    name: legends[envelope],
                    type: 'line',
                    data: data.values[envelope],
                    itemStyle: LineChartStyles[envelope].itemStyle,
                    showSymbol: false,
                }
            ]
        })
    }

    const renderFrequencyDomainChart = (data: any) => {
        const legends = ["X轴", "Y轴", "Z轴"];
        setChartOptions({
            ...defaultChartOption,
            legend: {data: legends},
            title: {text: `${getChartTitle()} ${data.frequency / 1000}KHz`, top: 0},
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    let relVal = `<strong>${params[0].name}</strong>&nbsp;Hz`;
                    for (let i = 0; i < params.length; i++) {
                        let value = Number(params[i].value).toFixed(3)
                        relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}`
                    }
                    return relVal;
                }
            },
            xAxis: {
                type: 'category',
                data: data.xAxis[0],
                name: "Hz"
            },
            series: legends.map((legend, i) => ({
                name: legend,
                type: 'line',
                data: data.values[i],
                itemStyle: LineChartStyles[i].itemStyle,
                showSymbol: false,
            })),
        })
    }

    const renderTimeDomainChart = (data: any) => {
        const legends = ["X轴", "Y轴", "Z轴"];
        setChartOptions({
            ...defaultChartOption,
            legend: {data: legends},
            title: {text: `${getChartTitle()} ${data.frequency / 1000}KHz`, top: 0},
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    let relVal = `<strong>${params[0].name}</strong>&nbsp;ms`;
                    for (let i = 0; i < params.length; i++) {
                        let value = Number(params[i].value).toFixed(3)
                        relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}`
                    }
                    return relVal;
                }
            },
            xAxis: {
                type: 'category',
                data: data.xAxis[0],
                name: "ms"
            },
            series: legends.map((legend, i) => ({
                name: legend,
                type: 'line',
                data: data.values[i],
                itemStyle: LineChartStyles[i].itemStyle,
                showSymbol: false,
            })),
        });
    }

    const getChartTitle = () => {
        switch (calculate) {
            case "accelerationTimeDomain":
                return "加速度时域(m/s²)";
            case "accelerationFrequencyDomain":
                return "加速度频域(m/s²)";
            case "accelerationEnvelope":
                return "加速度包络(m/s²)";
            case "velocityTimeDomain":
                return "速度时域(mm/s)";
            case "velocityFrequencyDomain":
                return "速度频域(mm/s)";
            case "velocityEnvelope":
                return "速度包络(mm/s)";
            case "displacementTimeDomain":
                return "位移时域(μm)";
            case "displacementFrequencyDomain":
                return "位移频域(μm)";
            case "displacementEnvelope":
                return "位移包络(μm)";
        }
        return ""
    }

    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: '80%',
            render: (timestamp: number) => moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: "操作",
            key: "action",
            render: (text: any, record: any) => (
                <Space size="middle">
                    <a onClick={() => onDownload(record.timestamp)}>下载</a>
                </Space>
            )
        }
    ]

    const onDownload = (timestamp: number) => {
        DownloadMeasurementRawDataRequest(measurement.id, timestamp, {calculate}).then(res => {
            if (res.status === 200) {
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${moment.unix(timestamp).local().format("YYYY-MM-DD_hh-mm-ss")}${getChartTitle()}.csv`)
                document.body.appendChild(link)
                link.click()
            }
        });
    }

    const renderChart = () => {
        if (timestamp === 0) {
            return <EmptyLayout description="数据不足"/>
        }
        return (
            <Spin spinning={timestamp === undefined}>
                <EChartsReact loadingOption={{text: '正在加载数据, 请稍等...'}} showLoading={loading} style={{height: 500}}
                              option={chartOptions} notMerge={true}/>
            </Spin>
        )
    }

    return <Row>
        <Col xl={6} xxl={4} style={{maxHeight: 500}}>
            <Row justify={"center"} style={{width: "100%"}}>
                <Col span={24}>
                    <DatePicker.RangePicker
                        allowClear={false}
                        value={[beginDate, endDate]}
                        onChange={(date, dateString) => {
                            if (dateString) {
                                setBeginDate(moment(dateString[0]).startOf('day'));
                                setEndDate(moment(dateString[1]).endOf('day'));
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row justify={"space-between"} style={{paddingTop: "4px"}}>
                <Col span={24}>
                    <ConfigProvider renderEmpty={() => <EmptyLayout description={"波形数据列表为空"}/>}>
                        <Table size={"middle"}
                               scroll={{y: 464}}
                               showHeader={false}
                               columns={columns}
                               dataSource={dataSource}
                               loading={dataSource === undefined}
                               pagination={false}
                               rowClassName={(record) => record.timestamp === timestamp ? 'ant-table-row-selected' : ''}
                               onRow={(record) => ({
                                   onClick: () => setTimestamp(record.timestamp),
                                   onMouseLeave: () => window.document.body.style.cursor = 'default',
                                   onMouseEnter: () => window.document.body.style.cursor = 'pointer'
                               })}
                        />
                    </ConfigProvider>
                </Col>
            </Row>
        </Col>
        <Col xl={18} xxl={20}>
            <Row justify={"start"}>
                <Col span={24}>
                    <Row justify={"end"}>
                        <Col>
                            <Space>
                                <Select defaultValue={calculate} style={{width: "120px"}} onChange={setCalculate}>
                                    <Option key={"accelerationTimeDomain"}
                                            value={"accelerationTimeDomain"}>加速度时域</Option>
                                    <Option key={"accelerationFrequencyDomain"}
                                            value={"accelerationFrequencyDomain"}>加速度频域</Option>
                                    <Option key={"accelerationEnvelope"} value={"accelerationEnvelope"}>加速度包络</Option>
                                    <Option key={'velocityTimeDomain'} value={'velocityTimeDomain'}>速度时域</Option>
                                    <Option key={'velocityFrequencyDomain'}
                                            value={'velocityFrequencyDomain'}>速度频域</Option>
                                    <Option key={"velocityEnvelope"} value={"velocityEnvelope"}>速度包络</Option>
                                    <Option key={'displacementTimeDomain'}
                                            value={'displacementTimeDomain'}>位移时域</Option>
                                    <Option key={'displacementFrequencyDomain'}
                                            value={'displacementFrequencyDomain'}>位移频域</Option>
                                    <Option key={"displacementEnvelope"} value={"displacementEnvelope"}>位移包络</Option>
                                </Select>
                                {
                                    calculate.indexOf('Envelope') !== -1 &&
                                    <Select style={{width: "120px"}} defaultValue={envelope} onChange={setEnvelope}>
                                        <Option key={0} value={0}>X轴包络</Option>
                                        <Option key={1} value={1}>Y轴包络</Option>
                                        <Option key={2} value={2}>Z轴包络</Option>
                                    </Select>
                                }
                            </Space>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    {renderChart()}
                </Col>
            </Row>
        </Col>
    </Row>
};

export default WaveData;
