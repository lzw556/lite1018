import {Checkbox, Col, ConfigProvider, DatePicker, Row, Select, Space, Spin, Table} from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import {useCallback} from 'react';
import {LineChartStyles} from '../../../../constants/chart';
import "../../../../index.css";
import {EmptyLayout} from "../../../layout";
import {Device} from "../../../../types/device";
import {
    DownloadDeviceWaveDataRequest,
    GetDeviceWaveDataRequest,
    GetDeviceWaveDataTimestampsRequest
} from "../../../../apis/device";
import {WaveData} from "../../../../types/wave_data";

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

const WaveDataChart: React.FC<{ device: Device }> = ({device}) => {
    const [beginDate, setBeginDate] = React.useState(moment().subtract(3, 'days').startOf('day'));
    const [endDate, setEndDate] = React.useState(moment().endOf('day'));
    const [dataSource, setDataSource] = React.useState<any>();
    const [timestamp, setTimestamp] = React.useState<number>();
    const [calculate, setCalculate] = React.useState<string>("accelerationTimeDomain");
    const [dimension, setDimension] = React.useState<number>(0);
    const [waveDataSource, setWaveDataSource] = React.useState<WaveData>();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);

    const fetchDeviceWaveDataTimestamps = useCallback(() => {
        GetDeviceWaveDataTimestampsRequest(device.id, beginDate.utc().unix(), endDate.utc().unix()).then(data => {
            setDataSource(data);
            if (data.length > 0) {
                setTimestamp(data[0].timestamp);
            }
        });
    }, [beginDate, endDate, device.id]);


    React.useEffect(() => {
        fetchDeviceWaveDataTimestamps();
    }, [fetchDeviceWaveDataTimestamps]);

    React.useEffect(() => {
        if (timestamp) {
            setIsLoading(true);
            GetDeviceWaveDataRequest(device.id, timestamp, {calculate, dimension}).then(data => {
                    setWaveDataSource(data);
                    setIsLoading(false);
                }
            ).catch(() => {
                setIsLoading(false);
            });
        }
    }, [timestamp, calculate, dimension]);

    const getChartTitle = () => {
        switch (calculate) {
            case "accelerationTimeDomain":
                return "加速度时域(m/s²)";
            case "accelerationFrequencyDomain":
                return "加速度频域(m/s²)";
            case "velocityTimeDomain":
                return "速度时域(mm/s)";
            case "velocityFrequencyDomain":
                return "速度频域(mm/s)";
            case "displacementTimeDomain":
                return "位移时域(μm)";
            case "displacementFrequencyDomain":
                return "位移频域(μm)";
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
        DownloadDeviceWaveDataRequest(device.id, timestamp, {calculate}).then(res => {
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
        if (waveDataSource) {
            const legends = ["X轴", "Y轴", "Z轴"];
            let series: any[] = [
                {
                    name: legends[dimension],
                    type: 'line',
                    data: waveDataSource.values,
                    itemStyle: LineChartStyles[dimension].itemStyle,
                    showSymbol: false,
                }
            ]
            if (isShowEnvelope) {
                series = [
                    {
                        name: legends[dimension],
                        type: 'line',
                        data: waveDataSource.highEnvelopes,
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
                        name: legends[dimension],
                        type: 'line',
                        data: waveDataSource.lowEnvelopes,
                        lineStyle: {
                            opacity: 0
                        },
                        areaStyle: {
                            color: '#ccc'
                        },
                        stack: 'confidence-band',
                        symbol: 'none'
                    },
                    ...series
                ]
            }
            const option = {
                ...defaultChartOption,
                legend: {
                    data: [legends[dimension]],
                    itemStyle: {
                        color: LineChartStyles[dimension].itemStyle.normal.color
                    }
                },
                title: {text: `${getChartTitle()} ${waveDataSource.frequency / 1000}KHz`, top: 0},
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    },
                    formatter: `{b} ${waveDataSource.xAxisUnit}<br/>${legends[dimension]}: {c}`
                },
                xAxis: {
                    type: 'category',
                    data: waveDataSource.xAxis,
                    name: waveDataSource.xAxisUnit,
                },
                series: series
            }
            return<EChartsReact loadingOption={{text: '正在加载数据, 请稍等...'}} showLoading={isLoading} style={{height: 500}}
                              option={option} notMerge={true}/>

        }else if (waveDataSource === undefined && !isLoading) {
            return <EmptyLayout description="数据不足"/>
        }
        return <div style={{height: "500px"}}/>;
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
            <Row justify={"space-between"} style={{paddingTop: "0px"}}>
                <Col span={24}>
                    <ConfigProvider renderEmpty={() => <EmptyLayout description={"波形数据列表为空"}/>}>
                        <Table size={"middle"}
                               scroll={{y: 500}}
                               showHeader={false}
                               columns={columns}
                               pagination={false}
                               dataSource={dataSource}
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
                                {
                                    calculate.indexOf("TimeDomain") !== -1 &&
                                    <Checkbox defaultChecked={isShowEnvelope}
                                              onChange={e => {
                                                  setIsShowEnvelope(e.target.checked);
                                              }}>显示包络</Checkbox>
                                }
                                <Select defaultValue={calculate} style={{width: "120px"}} onChange={setCalculate}>
                                    <Option key={"accelerationTimeDomain"}
                                            value={"accelerationTimeDomain"}>加速度时域</Option>
                                    <Option key={"accelerationFrequencyDomain"}
                                            value={"accelerationFrequencyDomain"}>加速度频域</Option>
                                    <Option key={'velocityTimeDomain'} value={'velocityTimeDomain'}>速度时域</Option>
                                    <Option key={'velocityFrequencyDomain'}
                                            value={'velocityFrequencyDomain'}>速度频域</Option>
                                    <Option key={'displacementTimeDomain'}
                                            value={'displacementTimeDomain'}>位移时域</Option>
                                    <Option key={'displacementFrequencyDomain'}
                                            value={'displacementFrequencyDomain'}>位移频域</Option>
                                </Select>
                                <Select style={{width: "120px"}} defaultValue={dimension} onChange={value => {
                                    setDimension(value);
                                }}>
                                    <Option key={0} value={0}>X轴</Option>
                                    <Option key={1} value={1}>Y轴</Option>
                                    <Option key={2} value={2}>Z轴</Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Spin spinning={isLoading} tip={"加载中..."}>
                        {renderChart()}
                    </Spin>
                </Col>
            </Row>
        </Col>
    </Row>
};

export default WaveDataChart;
