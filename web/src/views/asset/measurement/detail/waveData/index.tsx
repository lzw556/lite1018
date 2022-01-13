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

const WaveData: React.FC<{ measurement: Measurement }> = ({measurement}) => {
    const [beginDate, setBeginDate] = React.useState(moment().subtract(3, 'days').startOf('day'));
    const [endDate, setEndDate] = React.useState(moment().endOf('day'));
    const [dataSource, setDataSource] = React.useState<any>();
    const [loading, setLoading] = React.useState(false);
    const [chartOptions, setChartOptions] = React.useState<any>({});
    const [timestamp, setTimestamp] = React.useState<number>();
    const [calculate, setCalculate] = React.useState<string>("accelerationTimeDomain");

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
                    const legends = ["X轴", "Y轴", "Z轴"];
                    console.log(data)
                    let xAxis = {
                        type: 'category',
                        data: data.values[0].map((_: any, index: number) => index + 1)
                    }
                    if (data.frequencies) {
                        switch (calculate) {
                            case "accelerationFrequencyDomain":
                            case "velocityFrequencyDomain":
                                xAxis = {
                                    type: 'category',
                                    data: data.frequencies[0]
                                }
                                break;
                        }
                    }
                    if (data.times) {
                        switch (calculate) {
                            case "accelerationTimeDomain":
                            case "velocityTimeDomain":
                                xAxis = {
                                    type: 'category',
                                    data: data.times[0]
                                }
                                break;
                        }
                    }
                    setChartOptions({
                        legend: {data: legends},
                        title: {text: `${getChartTitle()} ${data.frequency / 1000}k Hz`, top: 0},
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params: any) {
                                let relVal = params[0].name;
                                for (let i = 0; i < params.length; i++) {
                                    let value = Number(params[i].value).toFixed(3)
                                    relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}`
                                }
                                return relVal;
                            }
                        },
                        xAxis: xAxis,
                        grid: {
                            left: '2%',
                            right: '8%',
                            bottom: '12%',
                            containLabel: true,
                            borderWidth: '0',
                        },
                        yAxis: {type: 'value'},
                        series: legends.map((legend, i) => ({
                            name: legend,
                            type: 'line',
                            data: data.values[i],
                            itemStyle: LineChartStyles[i].itemStyle,
                            showSymbol: false,
                        })),
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
                    });
                    setLoading(false);
                }
            );
        }
    }, [timestamp, calculate]);

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
                              option={chartOptions}/>
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
                        <Select defaultValue={calculate} style={{width: "120px"}} onChange={setCalculate}>
                            <Option key={"accelerationTimeDomain"} value={"accelerationTimeDomain"}>加速度时域</Option>
                            <Option key={"accelerationFrequencyDomain"}
                                    value={"accelerationFrequencyDomain"}>加速度频域</Option>
                            <Option key={'velocityTimeDomain'} value={'velocityTimeDomain'}>速度时域</Option>
                            <Option key={'velocityFrequencyDomain'} value={'velocityFrequencyDomain'}>速度频域</Option>
                        </Select>
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
