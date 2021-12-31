import {Col, DatePicker, Row, Space, Spin, Table} from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import {
    DownloadMeasurementRawDataRequest,
    GetMeasurementRawDataRequest,
    GetMeasurementRawDataTimestampRequest
} from '../../../../../apis/measurement';
import {LineChartStyles} from '../../../../../constants/chart';
import {Measurement} from '../../../../../types/measurement';
import "../../../index.css";

const MeasurementRawData: React.FC<{ measurement: Measurement }> = ({measurement}) => {
    const [beginDate, setBeginDate] = React.useState(moment().subtract(7, 'days').startOf('day'));
    const [endDate, setEndDate] = React.useState(moment().endOf('day'));
    const [dataSource, setDataSource] = React.useState<any>();
    const [loading, setLoading] = React.useState(false);
    const [chartOptions, setChartOptions] = React.useState<any>({});
    const [timestamp, setTimestamp] = React.useState<number>();

    React.useEffect(() => {
        GetMeasurementRawDataTimestampRequest(
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
            GetMeasurementRawDataRequest(measurement.id, timestamp).then(
                ({values}: { timestamp: number; values: number[] }) => {
                    const legends = ['X轴', 'Y轴', 'Z轴'];
                    setChartOptions({
                        legend: {data: legends},
                        xAxis: {
                            type: 'category',
                            data: Object.keys(values.filter((val, i) => i % 3 === 0)).map((val) => Number(val))
                        },
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
                            data: values.filter((val, j) => j % legends.length === i),
                            itemStyle: LineChartStyles[i].itemStyle
                        })),
                        animation: false,
                        smooth: true,
                        dataZoom: [
                            {
                                type: 'slider',
                                show: true,
                                startValue: 0,
                                endValue: 5000,
                                height: '32',
                                zoomLock: false
                            }
                        ]
                    });
                    setLoading(false);
                }
            );
        }
    }, [timestamp]);

    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
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
        DownloadMeasurementRawDataRequest(measurement.id, timestamp).then(res => {
            if (res.status === 200) {
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${moment.unix(timestamp).local().format("YYYY-MM-DD_hh-mm-ss")}.csv`)
                document.body.appendChild(link)
                link.click()
            }
        });
    }

    const renderChart = () => {
        return (
            <Spin spinning={timestamp === undefined}>
                <EChartsReact loadingOption={{ text: '正在加载数据, 请稍等...' }}  showLoading={loading} style={{height: 500}} option={chartOptions}/>
            </Spin>
        )
    }

    return  <Row>
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
            <Row justify={"space-between"} style={{maxHeight: "464px", overflow: "auto", paddingTop: "4px"}}>
                <Col span={24}>
                    <Table size={"middle"}
                           style={{width: "100%"}}
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
                </Col>
            </Row>
        </Col>
        <Col xl={18} xxl={20}>
            {
                renderChart()
            }
        </Col>
    </Row>
};

export default MeasurementRawData;
