import {useEffect, useState} from "react";
import {GetDeviceDataRequest, PagingDevicesRequest} from "../../../apis/device";
import {Button, Card, Col, DatePicker, Row, Select, Space} from "antd";
import {CaretDownOutlined, DeleteOutlined, DownloadOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {Device} from "../../../types/device";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import LabelSelect from "../../../components/labelSelect";
import Label from "../../../components/label";
import ShadowCard from "../../../components/shadowCard";
import {DefaultHistoryDataOption, LineChartStyles} from "../../../constants/chart";
import AssetSelect from "../../../components/assetSelect";
import {GetFieldName} from "../../../constants/field";
import {GetSensors} from "../../../types/device_type";
import {EmptyLayout} from "../../layout";
import DownloadModal from "./modal/downloadModal";
import RemoveModal from "./modal/removeModal";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";

const {Option} = Select
const {RangePicker} = DatePicker

const HistoryDataPage = () => {
    const [devices, setDevices] = useState<Device[]>([])
    const [assetId, setAssetId] = useState<number>(0)
    const [device, setDevice] = useState<Device>()
    const [property, setProperty] = useState<any>()
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [option, setOption] = useState<any>()
    const [downloadVisible, setDownloadVisible] = useState<boolean>(false)
    const [removeVisible, setRemoveVisible] = useState<boolean>(false)
    const [height] = useState<number>(window.innerHeight - 230)
    const [refreshKey, setRefreshKey] = useState<number>(0)

    const onAssetChange = (value: number) => {
        setAssetId(value)
        setDevices([])
        setDevice(undefined)
    }

    const onLoadDevices = (open: any) => {
        if (open) {
            PagingDevicesRequest(assetId, 1, 100, {}).then(data => {
                setDevices(data.result)
            })
        }
    }

    const onDeviceChange = (value: number) => {
        const d = devices.find(d => d.id === value)
        setDevice(d)
        setProperty(d?.properties[0])
    }

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
        }, [property, startDate, endDate, refreshKey]
    )

    return <Content>
        <MyBreadcrumb>
            <Space>
                <HasPermission value={Permission.DeviceDataDownload}>
                    <Button type="primary" onClick={() => {
                        setDownloadVisible(true)
                    }}>下载数据<DownloadOutlined/></Button>
                </HasPermission>
                <HasPermission value={Permission.DeviceDataDelete}>
                    <Button type="default" danger onClick={_ => setRemoveVisible(true)}>清空数据<DeleteOutlined/></Button>
                </HasPermission>
            </Space>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                <ShadowCard>
                    <Row justify="center">
                        <Col span={24}>
                            <Space>
                                <Label name={"资产"}>
                                    <AssetSelect style={{width: "120px"}}
                                                 bordered={false}
                                                 defaultValue={assetId}
                                                 defaultActiveFirstOption={true}
                                                 placeholder={"请选择资产"}
                                                 onChange={onAssetChange}>
                                        <Option key={0} value={0}>所有资产</Option>
                                    </AssetSelect>
                                </Label>
                                <LabelSelect label={"设备"} placeholder={"请选择设备"} style={{width: "120px"}}
                                             onDropdownVisibleChange={onLoadDevices}
                                             onChange={onDeviceChange} suffixIcon={<CaretDownOutlined/>}>
                                    {
                                        devices.filter(item => GetSensors().includes(item.typeId)).map(item =>
                                            <Option key={item.id} value={item.id}>{item.name}</Option>
                                        )
                                    }
                                </LabelSelect>
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
                            </Space>
                        </Col>
                    </Row>
                    <br/>
                    <Row justify="center">
                        <Col span={24}>
                            <Card bordered={false} style={{height: `${height}px`}}>
                                {
                                    option ? <ReactECharts option={option}
                                                           style={{height: `${height - 20}px`, border: "none"}}/> :
                                        <EmptyLayout description={"暂无数据"} style={{height: `${height}px`}}/>
                                }
                            </Card>
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
        <DownloadModal visible={downloadVisible} device={device} property={property} onCancel={() => {
            setDownloadVisible(false)
        }} onSuccess={() => {
            setDownloadVisible(false)
        }}/>
        <RemoveModal visible={removeVisible} device={device} onCancel={() => setRemoveVisible(false)} onSuccess={() => {
            setRemoveVisible(false)
            setRefreshKey(refreshKey + 1)
        }}/>
    </Content>
}

export default HistoryDataPage