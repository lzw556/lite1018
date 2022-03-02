import {Checkbox, Col, ConfigProvider, DatePicker, Pagination, Row, Select, Space, Table} from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import {useCallback} from 'react';
import {LineChartStyles} from '../../../../constants/chart';
import "../../../../index.css";
import {EmptyLayout} from "../../../layout";
import {Device} from "../../../../types/device";
import {
    DownloadDeviceDataByTimestampRequest,
    GetDeviceDataRequest,
    PagingDeviceDataRequest
} from "../../../../apis/device";
import {PageResult} from "../../../../types/page";

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
    const [dataSource, setDataSource] = React.useState<PageResult<any>>();
    const [deviceData, setDeviceData] = React.useState<any>();
    const [calculate, setCalculate] = React.useState<string>("accelerationTimeDomain");
    const [dimension, setDimension] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);

    const fetchDeviceDataByTimestamp = useCallback((timestamp:number) => {
        console.log(dimension);
        setIsLoading(true);
        GetDeviceDataRequest(device.id, timestamp, {calculate, dimension, data_type:16842753}).then(data => {
            setIsLoading(false);
            setDeviceData(data);
        }).catch(e => {
            setIsLoading(false);
        })
    }, [calculate, dimension])

    const fetchDeviceWaveDataTimestamps = useCallback(() => {
        PagingDeviceDataRequest(device.id, 1, 10, {from: beginDate.utc().unix(), to: endDate.utc().unix(), data_type:16842753}).then(data => {
            setDataSource(data)
            if (data.total > 0) {
                fetchDeviceDataByTimestamp(data.result[0].timestamp)
            }
        })
    }, [beginDate, endDate, device.id]);


    React.useEffect(() => {
        fetchDeviceWaveDataTimestamps();
    }, [fetchDeviceWaveDataTimestamps]);

    React.useEffect(() => {
        if (deviceData) {
            fetchDeviceDataByTimestamp(deviceData.timestamp);
        }
    }, [fetchDeviceDataByTimestamp])

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
        DownloadDeviceDataByTimestampRequest(device.id, timestamp, {calculate, data_type:16842753}).then(res => {
            if (res.status === 200) {
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${moment.unix(timestamp).local().format("YYYY-MM-DD_hh-mm-ss")}${getChartTitle()}.csv`)
                document.body.appendChild(link)
                link.click()
            }
        })
    }

    const renderChart = () => {
        if (deviceData === undefined && !isLoading) {
            return <EmptyLayout description="数据不足"/>
        } else {
            let option: any = {...defaultChartOption};
            if (deviceData) {
                const data = deviceData.values
                const legends = ["X轴", "Y轴", "Z轴"];
                let series: any[] = [
                    {
                        name: legends[dimension],
                        type: 'line',
                        data: data.values,
                        itemStyle: LineChartStyles[dimension].itemStyle,
                        showSymbol: false,
                    }
                ]
                if (isShowEnvelope) {
                    series = [
                        {
                            name: legends[dimension],
                            type: 'line',
                            data: data.highEnvelopes,
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
                            data: data.lowEnvelopes,
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
                option = {
                    ...defaultChartOption,
                    legend: {
                        data: [legends[dimension]],
                        itemStyle: {
                            color: LineChartStyles[dimension].itemStyle.normal.color
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
                        formatter: `{b} ${data.xAxisUnit}<br/>${legends[dimension]}: {c}`
                    },
                    xAxis: {
                        type: 'category',
                        data: data.xAxis,
                        name: data.xAxisUnit,
                    },
                    series: series
                }
            }
            return <EChartsReact loadingOption={{text: '正在加载数据, 请稍等...'}} showLoading={isLoading} style={{height: 500}}
                                 option={option} notMerge={true}/>
        }
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
                               dataSource={dataSource?.result}
                               rowClassName={(record) => record.timestamp === deviceData?.timestamp ? 'ant-table-row-selected' : ''}
                               onRow={(record) => ({
                                   onClick: () => {
                                       if (record.timestamp !== deviceData?.timestamp) {
                                           fetchDeviceDataByTimestamp(record.timestamp)
                                       }
                                   },
                                   onMouseLeave: () => window.document.body.style.cursor = 'default',
                                   onMouseEnter: () => window.document.body.style.cursor = 'pointer'
                               })}
                        />
                        {
                            dataSource && <Pagination size={"small"}
                                                      style={{paddingTop: "8px"}}
                                                      current={dataSource.page}
                                                      total={dataSource.total}
                                                      pageSize={dataSource.size}/>
                        }

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
                    {renderChart()}
                </Col>
            </Row>
        </Col>
    </Row>
};

export default WaveDataChart;
