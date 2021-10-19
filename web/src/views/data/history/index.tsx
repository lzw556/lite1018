import {useEffect, useState} from "react";
import {GetDeviceDataRequest, PagingDevicesRequest} from "../../../apis/device";
import {Button, Card, Col, DatePicker, Row, Select, Space} from "antd";
import {CaretDownOutlined, DownloadOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import AssetSelect from "../../asset/select/assetSelect";
import {Device} from "../../../types/device";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import LabelSelect from "../../../components/labelSelect";
import Label from "../../../components/label";
import DownloadDataModal from "../download";

const {Option} = Select
const {RangePicker} = DatePicker

const defaultHistoryDataOption = {
    title: {
        text: ''
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: []
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
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

const HistoryDataPage = () => {
    const [devices, setDevices] = useState<Device[]>([])
    const [assetId, setAssetId] = useState<number>(0)
    const [device, setDevice] = useState<Device>()
    const [property, setProperty] = useState<any>()
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [option, setOption] = useState<any>(defaultHistoryDataOption)
    const [downloadVisible, setDownloadVisible] = useState<boolean>(false)
    const [height] = useState<number>(window.innerHeight - 230)

    const onAssetChange = (value: number) => {
        setAssetId(value)
        setDevices([])
        setDevice(undefined)
    }

    const onLoadDevices = (open: any) => {
        if (open) {
            PagingDevicesRequest(assetId, 1, 100, {}).then(res => {
                if (res.code === 200) {
                    setDevices(res.data.result)
                }
            })
        }
    }

    const onDeviceChange = (value: number) => {
        setDevice(devices.find(item => item.id === value))
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
            GetDeviceDataRequest(device.id, property.id, startDate.utc().unix(), endDate.utc().unix()).then(res => {
                if (res.code === 200) {
                    const series = Object.keys(res.data.fields).map(key => {
                        return {name: key, type: 'line', areaStyle: {normal: {}}, data: res.data.fields[key]}
                    })
                    const xAxis = [{
                        type: 'category',
                        boundaryGap: false,
                        data: res.data.time.map(item => moment.unix(item).local().format("YYYY-MM-DD HH:mm:ss"))
                    }]
                    setOption(Object.assign({}, option, {
                        title: {text: res.data.name},
                        tooltip: {formatter: `{b}<br/>{a}: {c}${res.data.unit}`},
                        xAxis: xAxis,
                        series: series
                    }))
                }
            })
        }
    }, [device, property, startDate, endDate])

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
                <Space>
                    <Button type="primary" onClick={() => {
                        setDownloadVisible(true)
                    }}>下载数据<DownloadOutlined/></Button>
                </Space>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "15px"}}>
                    <Card>
                        <Row justify="center">
                            <Col span={24}>
                                <Space>
                                    <Label name={"资产"}>
                                        <AssetSelect style={{width: "120px"}}
                                                     bordered={false}
                                                     defaultValue={assetId}
                                                     defaultActiveFirstOption={true}
                                                     defaultOption={{value: 0, text: "所有资产"}} placeholder={"请选择资产"}
                                                     onChange={onAssetChange} suffixIcon={<CaretDownOutlined/>}/>
                                    </Label>
                                    <LabelSelect label={"设备"} placeholder={"请选择设备"} style={{width: "120px"}}
                                                 onDropdownVisibleChange={onLoadDevices}
                                                 onChange={onDeviceChange} suffixIcon={<CaretDownOutlined/>}>
                                        {
                                            devices.filter(item => item.category === 3).map(item =>
                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                            )
                                        }
                                    </LabelSelect>
                                    <LabelSelect label={"属性"} placeholder={"请选择属性"} style={{width: "120px"}}
                                                 onChange={onPropertyChange} suffixIcon={<CaretDownOutlined/>}>
                                        {
                                            device ? device.properties.map(item =>
                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                            ) : null
                                        }
                                    </LabelSelect>
                                    <RangePicker
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
                                <Card style={{height: `${height}px`}}>
                                    <ReactECharts option={option} style={{height: `${height - 20}px`}}/>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Content>
            </Col>
        </Row>
        <DownloadDataModal visible={downloadVisible} onCancel={() => {
            setDownloadVisible(false)
        }} onSuccess={() => {
            setDownloadVisible(false)
        }}/>
    </div>
}

export default HistoryDataPage