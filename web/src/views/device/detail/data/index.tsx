import {FC, useEffect, useState} from "react";
import {Button, Card, Col, DatePicker, Modal, Row, Select, Space} from "antd";
import {CaretDownOutlined, DeleteOutlined, DownloadOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {Device} from "../../../../types/device";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import LabelSelect from "../../../../components/labelSelect";
import {DefaultHistoryDataOption, LineChartStyles} from "../../../../constants/chart";
import {GetFieldName} from "../../../../constants/field";
import {EmptyLayout} from "../../../layout";
import {GetDeviceDataRequest, RemoveDeviceDataRequest} from "../../../../apis/device";
import HasPermission from "../../../../permission";
import {Permission} from "../../../../permission/permission";
import DownloadModal from "./modal/downloadModal";

const {Option} = Select
const {RangePicker} = DatePicker

export interface DeviceDataProps {
    device?: Device
}

const HistoryDataPage: FC<DeviceDataProps> = ({device}) => {
    const [property, setProperty] = useState<any>(device?.properties[0])
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [option, setOption] = useState<any>()
    const [downloadVisible, setDownloadVisible] = useState<boolean>(false)


    const onPropertyChange = (value: number) => {
        if (device) {
            setProperty(device.properties.find(item => item.id === value))
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

    useEffect(() => {
            if (device && property && startDate && endDate) {
                setOption(undefined)
                GetDeviceDataRequest(device.id, property.id, startDate.utc().unix(), endDate.utc().unix()).then(data => {
                    if (!Array.isArray(data)) {
                        const {fields, time, name, unit} = data
                        const keys = Object.keys(data.fields)
                        const legend = keys.map(key => GetFieldName(key))
                        const series = keys.map((key, index) => {
                            return {
                                ...LineChartStyles[index],
                                name: GetFieldName(key),
                                type: 'line',
                                data: fields[key]
                            }
                        })
                        const xAxis = [{
                            type: 'category',
                            boundaryGap: false,
                            data: time.map(item => moment.unix(item).local().format("YYYY-MM-DD HH:mm:ss"))
                        }]
                        setOption({
                            ...DefaultHistoryDataOption,
                            tooltip: {
                                trigger: 'axis',
                                formatter: function (params: any) {
                                    let relVal = params[0].name;
                                    for (let i = 0; i < params.length; i++) {
                                        let value = Number(params[i].value).toFixed(3)
                                        relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${unit}`
                                    }
                                    return relVal;
                                }
                            },
                            title: {text: name},
                            legend: {data: legend},
                            series,
                            xAxis
                        })
                    }
                })
            }
        }, [property, startDate, endDate]
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
                        <Space style={{textAlign:"center"}}>
                            <LabelSelect label={"属性"} value={property?.id} placeholder={"请选择属性"}
                                         style={{width: "120px"}}
                                         onChange={onPropertyChange} suffixIcon={<CaretDownOutlined/>}>
                                {
                                    device ? device.properties.map(item =>
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                    ) : null
                                }
                            </LabelSelect>
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