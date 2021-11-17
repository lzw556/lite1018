import {Card, Col, DatePicker, Row, Select, Space} from "antd";
import {Content} from "antd/lib/layout/layout";
import Label from "../../../components/label";
import {useState} from "react";
import moment from "moment";
import SensorSelect from "../../../components/sensorSelect";
import AssetSelect from "../../../components/assetSelect";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import AlarmRecordTable from "./alarmRecordTable";

const {Option} = Select
const {RangePicker} = DatePicker

const AlarmRecordPage = () => {
    const [assetId, setAssetId] = useState<number>(0)
    const [deviceId, setDeviceId] = useState<number>(0)
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf("day").subtract(1, "day"))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf("day"))
    const [alarmLevels, setAlarmLevels] = useState<number[]>([1, 2, 3])
    const [currentKey, setCurrentKey] = useState<string>("active")

    const onAssetChanged = (value: any) => {
        setAssetId(value)
        setDeviceId(0)
    }

    const onDeviceChanged = (value: any) => {
        setDeviceId(value)
    }

    const tabList = [
        {
            key: "active",
            tab: "活动报警",
        },
        {
            key: "history",
            tab: "历史报警",
        }
    ]

    const contents = new Map<string, any>([
        ["active", <AlarmRecordTable type={"active"} start={startDate.utc().unix()} stop={endDate.utc().unix()} device={deviceId} asset={assetId} levels={alarmLevels}/>],
        ["history", <AlarmRecordTable type={"history"} start={startDate.utc().unix()} stop={endDate.utc().unix()} device={deviceId} asset={assetId} levels={alarmLevels}/>]
    ])

    return <Content>
        <MyBreadcrumb items={["报警管理", "报警列表"]}>
            <Space>
                <RangePicker
                    value={[startDate, endDate]}
                    allowClear={false}
                    onChange={(date, dateString) => {
                        if (dateString) {
                            setStartDate(moment(dateString[0]).startOf('day'))
                            setEndDate(moment(dateString[1]).endOf('day'))
                        }
                    }}/>
            </Space>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                <Card>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <Space>
                                <Label name={"资产"}>
                                    <AssetSelect bordered={false} style={{width: "128px"}} defaultValue={assetId}
                                                 defaultActiveFirstOption={true}
                                                 placeholder={"请选择资产"}
                                                 onChange={onAssetChanged}>
                                        <Option key={0} value={0}>所有资产</Option>
                                    </AssetSelect>
                                </Label>
                                <Label name={"设备"}>
                                    <SensorSelect bordered={false} style={{width: "128px"}} value={deviceId}
                                                  assetId={assetId} placeholder={"请选择设备"}
                                                  onChange={onDeviceChanged}/>
                                </Label>
                                <Label name={"报警级别"}>
                                    <Select bordered={false} mode={"multiple"} value={alarmLevels}
                                            style={{width: "200px"}} onChange={value => {
                                        if (value.length) {
                                            setAlarmLevels(value)
                                        } else {
                                            setAlarmLevels([1, 2, 3])
                                        }
                                    }}>
                                        <Option key={1} value={1}>提示</Option>
                                        <Option key={2} value={2}>重要</Option>
                                        <Option key={3} value={3}>紧急</Option>
                                    </Select>
                                </Label>
                            </Space>
                        </Col>
                    </Row>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <Card bordered={false} tabList={tabList} activeTabKey={currentKey} size={"small"} onTabChange={key => {
                                setCurrentKey(key)
                            }}>
                                {contents.get(currentKey)}
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    </Content>
}

export default AlarmRecordPage