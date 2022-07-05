import {Checkbox, Col, ConfigProvider, DatePicker, message, Modal, Row, Select, Space, Spin, Table} from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import {useCallback, useState} from 'react';
import {LineChartStyles} from '../../../../constants/chart';
import '../../../../index.css';
import {EmptyLayout} from '../../../layout';
import {Device} from '../../../../types/device';
import {
    DownloadDeviceDataByTimestampRequest,
    FindDeviceDataRequest,
    GetDeviceDataRequest
} from '../../../../apis/device';
import {isMobile} from '../../../../utils/deviceDetection';
import {DownloadOutlined, LoadingOutlined} from '@ant-design/icons';
import usePermission, {Permission} from "../../../../permission/permission";
import {DeviceType} from "../../../../types/device_type";

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
        borderWidth: '0'
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
};

const WaveDataChart: React.FC<{ device: Device }> = ({device}) => {
    const [beginDate, setBeginDate] = React.useState(moment().subtract(3, 'days').startOf('day'));
    const [endDate, setEndDate] = React.useState(moment().endOf('day'));
    const [dataSource, setDataSource] = React.useState<any>();
    const [deviceData, setDeviceData] = React.useState<any>();
    const [calculate, setCalculate] = React.useState<string>('accelerationTimeDomain');
    const [dimension, setDimension] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingPage, setIsLoadingPage] = React.useState(false);
    const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);
    const [dataType] = useState(device.typeId === DeviceType.VibrationTemperature3AxisAdvanced ? 16842758 : 16842753)
    const [timestamp, setTimestamp] = useState<number>()
    const {hasPermission} = usePermission();

    const fetchDeviceDataByTimestamp = useCallback(
        () => {
            if (timestamp) {
                setIsLoading(true);
                GetDeviceDataRequest(device.id, timestamp, {calculate, dimension, data_type: dataType})
                    .then((data) => {
                        setIsLoading(false);
                        setDeviceData(data);
                    })
                    .catch((e) => {
                        setIsLoading(false);
                    });
            }
        },
        [calculate, dimension, timestamp]
    );

    const fetchDeviceWaveDataTimestamps = useCallback(() => {
        setIsLoadingPage(true);
        FindDeviceDataRequest(device.id, beginDate.utc().unix(), endDate.utc().unix(), {
            data_type: dataType
        })
            .then((data) => {
                setIsLoadingPage(false);
                setDataSource(data);
                if (data.length > 0) {
                    setTimestamp(data[0].timestamp);
                }
            })
            .catch((_) => {
                setIsLoadingPage(false);
            });
    }, [beginDate, endDate, device.id]);

    React.useEffect(() => {
        fetchDeviceWaveDataTimestamps();
    }, [fetchDeviceWaveDataTimestamps]);

    React.useEffect(() => {
        fetchDeviceDataByTimestamp();
    }, [fetchDeviceDataByTimestamp]);

    const getChartTitle = () => {
        switch (calculate) {
            case 'accelerationTimeDomain':
                return '加速度时域(m/s²)';
            case 'accelerationFrequencyDomain':
                return '加速度频域(m/s²)';
            case 'velocityTimeDomain':
                return '速度时域(mm/s)';
            case 'velocityFrequencyDomain':
                return '速度频域(mm/s)';
            case 'displacementTimeDomain':
                return '位移时域(μm)';
            case 'displacementFrequencyDomain':
                return '位移频域(μm)';
        }
        return '';
    };

    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: '80%',
            render: (timestamp: number) => moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => {
                if (hasPermission(Permission.DeviceRawDataDownload)) {
                    return <Space size='middle'>
                        <a onClick={() => onDownload(record.timestamp)}>下载</a>
                    </Space>
                }
            }
        }
    ];
    const onDownload = (timestamp: number) => {
        let modal = Modal.info({title: "数据下载", content: "数据下载中...", okText:"保存", okButtonProps: {disabled: true}})
        DownloadDeviceDataByTimestampRequest(device.id, timestamp, {
            calculate,
            data_type: dataType
        }).then((res) => {
            modal.update({
                title: "下载成功",
                content: `波形数据(${moment.unix(timestamp).local().format('YYYY-MM-DD_hh-mm-ss')}).csv`,
                okButtonProps: {
                    disabled: false
                },
                onOk: () => {
                    if (res.status === 200) {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute(
                            'download',
                            `波形数据(${moment.unix(timestamp).local().format('YYYY-MM-DD_hh-mm-ss')}).csv`
                        );
                        document.body.appendChild(link);
                        link.click();
                    }
                }
            })
        }).catch(e => {
            modal.destroy();
            message.error("波形数据下载超时").then();
        });
    };

    const renderChart = () => {
        let option = {};
        if (deviceData && deviceData.values) {
            const data = deviceData.values;
            const legends = ['X轴', 'Y轴', 'Z轴'];
            let series: any[] = [
                {
                    name: legends[dimension],
                    type: 'line',
                    data: data.values,
                    itemStyle: LineChartStyles[dimension].itemStyle,
                    showSymbol: false
                }
            ];
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
                ];
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
                    name: data.xAxisUnit
                },
                series
            };
        }
        return (
            <EChartsReact
                loadingOption={{text: '正在加载数据, 请稍等...'}}
                showLoading={isLoading}
                style={{height: 500}}
                option={option}
                notMerge={true}
            />
        );
    };

    const select_fields = (
        <Select
            defaultValue={calculate}
            style={{width: !isMobile ? '120px' : '100%'}}
            onChange={setCalculate}
        >
            <Option key={'accelerationTimeDomain'} value={'accelerationTimeDomain'}>
                加速度时域
            </Option>
            <Option key={'accelerationFrequencyDomain'} value={'accelerationFrequencyDomain'}>
                加速度频域
            </Option>
            <Option key={'velocityTimeDomain'} value={'velocityTimeDomain'}>
                速度时域
            </Option>
            <Option key={'velocityFrequencyDomain'} value={'velocityFrequencyDomain'}>
                速度频域
            </Option>
            <Option key={'displacementTimeDomain'} value={'displacementTimeDomain'}>
                位移时域
            </Option>
            <Option key={'displacementFrequencyDomain'} value={'displacementFrequencyDomain'}>
                位移频域
            </Option>
        </Select>
    );
    const select_axis = (
        <Select
            style={{width: !isMobile ? '120px' : '100%'}}
            defaultValue={dimension}
            onChange={(value) => {
                setDimension(value);
            }}
        >
            <Option key={0} value={0}>
                X轴
            </Option>
            <Option key={1} value={1}>
                Y轴
            </Option>
            <Option key={2} value={2}>
                Z轴
            </Option>
        </Select>
    );
    if (isMobile) {
        if (!timestamp) {
            return <EmptyLayout description={'波形数据列表为空'}/>;
        }
        return (
            <>
                <Row style={{marginBottom: 8}}>
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
                <Row style={{marginBottom: 8}} align='middle'>
                    <Col span={14}>
                        <Select
                            style={{width: '100%'}}
                            defaultValue={deviceData?.timestamp}
                            onChange={(value) => {
                                if (value !== deviceData?.timestamp) {
                                    setDeviceData(deviceData);
                                }
                            }}
                        >
                            {dataSource.map((item: any) => (
                                <Option key={item.timestamp} value={item.timestamp}>
                                    {moment.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={7} offset={1}>
                        {calculate.indexOf('TimeDomain') !== -1 && (
                            <Checkbox
                                defaultChecked={isShowEnvelope}
                                onChange={(e) => {
                                    setIsShowEnvelope(e.target.checked);
                                }}
                            >
                                显示包络
                            </Checkbox>
                        )}
                    </Col>
                    <Col span={2}>
                        <DownloadOutlined onClick={() => onDownload(deviceData?.timestamp)}/>
                    </Col>
                </Row>
                <Row justify='space-between' style={{marginBottom: 16}}>
                    <Col span={11}>{select_fields}</Col>
                    <Col span={11}>{select_axis}</Col>
                </Row>
                <Row>
                    <Col span={24}>{renderChart()}</Col>
                </Row>
            </>
        );
    } else {
        return (
            <>
                <Row>
                    <Col xl={6} xxl={4} style={{maxHeight: 500}}>
                        <Row justify={'center'} style={{width: '100%'}}>
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
                        <Row justify={'space-between'} style={{paddingTop: '0px'}}>
                            <Col span={24}>
                                <ConfigProvider renderEmpty={() => <EmptyLayout description={'波形数据列表为空'}/>}>
                                    <Table
                                        size={'middle'}
                                        scroll={{y: 500}}
                                        showHeader={false}
                                        columns={columns}
                                        pagination={false}
                                        dataSource={dataSource}
                                        rowClassName={(record) =>
                                            record.timestamp === timestamp ? 'ant-table-row-selected' : ''
                                        }
                                        onRow={(record) => ({
                                            onClick: () => {
                                                if (record.timestamp !== timestamp) {
                                                    setTimestamp(record.timestamp);
                                                }
                                            },
                                            onMouseLeave: () => (window.document.body.style.cursor = 'default'),
                                            onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
                                        })}
                                    />
                                </ConfigProvider>
                            </Col>
                        </Row>
                    </Col>
                    <Col xl={18} xxl={20}>
                        <Row justify={'start'}>
                            <Col span={24}>
                                <Row justify={'end'}>
                                    <Col>
                                        <Space wrap={true}>
                                            {calculate.indexOf('TimeDomain') !== -1 && (
                                                <Checkbox
                                                    defaultChecked={isShowEnvelope}
                                                    onChange={(e) => {
                                                        setIsShowEnvelope(e.target.checked);
                                                    }}
                                                >
                                                    显示包络
                                                </Checkbox>
                                            )}
                                            {select_fields}
                                            {select_axis}
                                        </Space>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>{renderChart()}</Col>
                        </Row>
                    </Col>
                </Row>
                <Modal title={"提示"}>
                    <Spin tip={"数据下载中..."}/>
                </Modal>
            </>
        );
    }
};

export default WaveDataChart;
