import {FC, useCallback, useEffect, useState} from "react";
import {Button, Card, Col, DatePicker, Modal, Row, Select, Space} from "antd";
import {DeleteOutlined, DownloadOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {Device} from "../../../../types/device";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import {EmptyLayout} from "../../../layout";
import {GetDeviceDataRequest, RemoveDeviceDataRequest} from "../../../../apis/device";
import HasPermission from "../../../../permission";
import {Permission} from "../../../../permission/permission";
import DownloadModal from "./modal/downloadModal";
import Label from "../../../../components/label";
import {DefaultHistoryDataOption, LineChartStyles} from "../../../../constants/chart";

const {Option} = Select
const {RangePicker} = DatePicker

export interface DeviceDataProps {
    device: Device
}

const HistoryDataPage: FC<DeviceDataProps> = ({device}) => {
    const [property, setProperty] = useState<any>(device.properties[0])
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [option, setOption] = useState<any>()
    const [downloadVisible, setDownloadVisible] = useState<boolean>(false)


    const onPropertyChange = (value: string) => {
        if (device) {
            setProperty(device.properties.find(item => item.key === value))
        }
    }

    const onSetDateRange = (value: number) => {
        setStartDate(moment().startOf('day').subtract(value, 'months'))
        setEndDate(moment().endOf('day'))
    }

    const renderExtraFooter = () => {
        return <Space>
            <Button type="text" onClick={() => onSetDateRange(1)}>最近一个月</Button>
            <Button type="text" onClick={() => onSetDateRange(3)}>最近三个月</Button>
            <Button type="text" onClick={() => onSetDateRange(6)}>最近半年</Button>
            <Button type="text" onClick={() => onSetDateRange(12)}>最近一年</Button>
        </Space>
    }

    const fetchPropertyData = useCallback(() => {
        GetDeviceDataRequest(device.id, property.key, startDate.utc().unix(), endDate.utc().unix()).then(data => {
            let series: any[]
            let legends: string[]
            switch (property.type) {
                case 'axis':
                    legends = ["X轴", "Y轴", "Z轴"]
                    series = legends.map((item, index) => {
                        return {
                            ...LineChartStyles[index],
                            name: item,
                            type: 'line',
                            data: data.map((item:any) => item.value[index])
                        }
                    })
                    break;
                default:
                    legends = [property.name]
                    series = [
                        {
                            ...LineChartStyles[0],
                            name: property.name,
                            type: 'line',
                            data: data.map((item:any) => item.value)
                        }
                    ]
                    break;
            }
            setOption({
                ...DefaultHistoryDataOption,
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params: any) {
                        let relVal = params[0].name;
                        for (let i = 0; i < params.length; i++) {
                            let value = Number(params[i].value).toFixed(3)
                            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`;
                        }
                        return relVal;
                    }
                },
                title: {text: property.name},
                legend: {data: legends},
                series,
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: data.map((item:any) => moment.unix(item.timestamp).local().format("YYYY-MM-DD HH:mm:ss"))
                }
            })
        })
    }, [property, startDate, endDate])

    useEffect(() => {
            fetchPropertyData()
        }, [fetchPropertyData]
    )

    const onRemoveDeviceData = () => {
        if (device) {
            Modal.confirm({
                title: "提示",
                content: `确定要删除设备${device.name}从${startDate.format("YYYY-MM-DD")}到${endDate.format("YYYY-MM-DD")}的数据吗？`,
                okText: "确定",
                cancelText: "取消",
                onOk: close => {
                    RemoveDeviceDataRequest(device.id, startDate.utc().unix(), endDate.utc().unix()).then(_ => close)
                },
            })
        }
    }

    return <Content>
        <Row justify="center">
            <Col span={24}>
                <Row justify="end">
                    <Col span={24} style={{textAlign: "right"}}>
                        <Space style={{textAlign: "center"}}>
                            <Label name={"属性"}>
                                <Select bordered={false} defaultValue={property.key} placeholder={"请选择属性"}
                                        style={{width: "120px"}} onChange={onPropertyChange}>
                                    {
                                        device ? device.properties.map(item =>
                                            <Option key={item.key} value={item.key}>{item.name}</Option>
                                        ) : null
                                    }
                                </Select>
                            </Label>
                            <RangePicker
                                allowClear={false}
                                value={[startDate, endDate]}
                                renderExtraFooter={renderExtraFooter}
                                onChange={(date, dateString) => {
                                    if (dateString) {
                                        setStartDate(moment(dateString[0]).startOf('day'))
                                        setEndDate(moment(dateString[1]).endOf('day'))
                                    }
                                }}/>
                            <HasPermission value={Permission.DeviceDataDownload}>
                                <Button type="primary" onClick={() => {
                                    setDownloadVisible(true)
                                }}><DownloadOutlined/></Button>
                            </HasPermission>
                            <HasPermission value={Permission.DeviceDataDelete}>
                                <Button type="default" danger onClick={onRemoveDeviceData}><DeleteOutlined/></Button>
                            </HasPermission>
                        </Space>
                    </Col>
                </Row>
                <Row justify="center">
                    <Col span={24}>
                        <Card bordered={false} style={{height: `400px`}}>
                            {
                                option ? <ReactECharts option={option}
                                                       notMerge={true}
                                                       style={{height: `380px`, border: "none"}}/> :
                                    <EmptyLayout description={"暂无数据"} style={{height: `400px`}}/>
                            }
                        </Card>
                    </Col>
                </Row>
            </Col>
        </Row>
        {
            device &&
            <DownloadModal visible={downloadVisible} device={device} property={property} onCancel={() => {
                setDownloadVisible(false)
            }} onSuccess={() => {
                setDownloadVisible(false)
            }}/>
        }
        {/*<RemoveModal visible={removeVisible} device={device} onCancel={() => setRemoveVisible(false)} onSuccess={() => {*/}
        {/*    setRemoveVisible(false)*/}
        {/*    setRefreshKey(refreshKey + 1)*/}
        {/*}}/>*/}
    </Content>
}

export default HistoryDataPage