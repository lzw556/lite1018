import {Asset} from "../../../types/asset";
import {Card, Col, List, Row, Select, Space, Statistic, Typography} from "antd";
import ShadowCard from "../../../components/shadowCard";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";
import {FC, useEffect, useState} from "react";
import {GetAlarmStatisticsRequest} from "../../../apis/alarm";
import moment from "moment";
import {GetAssetStatisticsRequest} from "../../../apis/asset";
import {Device} from "../../../types/device";
import AlertIcon from "../../../components/alertIcon";
import {DeviceType, DeviceTypeString} from "../../../types/device_type";
import {GetPrimaryProperty} from "../../../types/property";
import {GetFieldName} from "../../../constants/field";
import {GetAlertColor} from "../../../types/alert_state";
import Label from "../../../components/label";

const {Title} = Typography
const {Option} = Select

export interface AssetStatisticProps {
    value: Asset;
}

const AssetStatistic: FC<AssetStatisticProps> = ({value}) => {
    const [alarmStatistics, setAlarmStatistics] = useState<any>();
    const [assetStatistics, setAssetStatistics] = useState<any>();
    const [deviceStatus, setDeviceStatus] = useState<number>(0);
    const [alertLevels, setAlertLevels] = useState<number[]>([0, 1, 2, 3]);

    const fetchAlarmStatistics = async () => {
        const res = await GetAlarmStatisticsRequest(moment().local().startOf("day").unix(), moment().local().endOf("day").unix(), {asset_id: value.id})
        if (res.code === 200) {
            setAlarmStatistics(res.data)
        }
    }

    const fetchAssetStatistics = async () => {
        const res = await GetAssetStatisticsRequest(value.id)
        if (res.code === 200) {
            setAssetStatistics(res.data)
        }
    }

    const renderDeviceCard = (device: Device) => {
        if (device.typeId !== DeviceType.Gateway && device.typeId !== DeviceType.Router) {
            const property = GetPrimaryProperty(device.properties, device.typeId)
            if (property) {
                if (property.data && property.data.fields && Object.keys(property.data.fields).length) {
                    const field = Object.keys(property.data.fields)[0]
                    const timestamp = property.data.time[0]
                    return <>
                        <Statistic title={GetFieldName(field)} valueStyle={{color: GetAlertColor(device.alertState)}}
                                   value={Number(property.data.fields[field]).toFixed(3)} suffix={property.unit}/>
                        <Card.Meta description={`${moment.unix(timestamp).local().format("YYYY-MM-DD HH:mm:ss")}`}/>
                    </>
                } else {
                    return <>
                        <Statistic title={property.name} value={"暂无数据"}/>
                        <Card.Meta description={"-"}/>
                    </>
                }
            }
        } else {
            return <>
                <Statistic title={DeviceTypeString(device.typeId)}
                           valueStyle={{color: device.state.isOnline ? ColorHealth : ColorWarn}}
                           value={device.state.isOnline ? "在线" : "离线"}/>
                <Card.Meta
                    description={device.state.connected ? moment.unix(device.state.connectedAt).local().format("YYYY-MM-DD HH:mm:ss") : "-"}/>
            </>
        }
    }

    const renderDeviceStatisticCard = () => {
        if (assetStatistics) {
            const total = assetStatistics.devices.length
            const online = assetStatistics.devices.filter((device: Device) => device.state.isOnline).length
            const alert = assetStatistics.devices.filter((device: Device) => device.alertState && device.alertState.level > 0).length
            const noAccess = assetStatistics.devices.filter((device: Device) => device.accessState === 0).length
            return <Row justify={"start"}>
                <Col span={8}>
                    <Statistic title={"报警设备"} value={alert} suffix={`/ ${total}`}/>
                </Col>
                <Col span={8}>
                    <Statistic title={"在线设备"} value={online} suffix={`/ ${total}`}/>
                </Col>
                <Col span={8}>
                    <Statistic title={"未入网设备"} value={noAccess} suffix={`/ ${total}`}/>
                </Col>
            </Row>
        }
    }

    const renderDatasource = () => {
        if (assetStatistics) {
            let filters = assetStatistics.devices
            if (deviceStatus > 0 && deviceStatus < 3) {
                filters = filters.filter((device: Device) => device.state.isOnline === (deviceStatus === 1) && device.accessState > 0)
            }
            if (deviceStatus === 3) {
                filters = filters.filter((device: Device) => device.accessState === 0)
            }
            filters = filters.filter((device: Device) => device.alertState ? alertLevels.includes(device.alertState.level) : true)
            return filters
        }
    }

    useEffect(() => {
        if (value) {
            fetchAlarmStatistics().then()
            fetchAssetStatistics().then()
        }
    }, [value])

    return <>
        <Row justify={"space-between"} gutter={16}>
            <Col span={8}>
                <ShadowCard hoverable={true}>
                    <Title level={4}>{assetStatistics?.asset.name}</Title>
                    {
                        assetStatistics && assetStatistics.status > 0 ?
                            <Statistic title={"状态"} value={"异常"}
                                       valueStyle={{color: ColorDanger, fontWeight: "bold"}}/> :
                            <Statistic title={"状态"} value={"正常"} valueStyle={{color: ColorHealth, fontWeight: "bold"}}/>
                    }
                </ShadowCard>
            </Col>
            <Col span={8}>
                <ShadowCard hoverable={true}>
                    <Title level={4}>设备统计</Title>
                    {
                        renderDeviceStatisticCard()
                    }
                </ShadowCard>
            </Col>
            <Col span={8}>
                <ShadowCard hoverable={true}>
                    <Title level={4}>今日报警统计</Title>
                    <Row justify={"start"}>
                        <Col span={6}>
                            <Statistic title={"未处理"}
                                       value={alarmStatistics ? alarmStatistics.untreated.reduce((acc: number, cur: number) => acc + cur, 0) : 0}/>
                        </Col>
                        <Col span={6}>
                            <Statistic title={"提示"} valueStyle={{color: ColorInfo}}
                                       value={alarmStatistics ? alarmStatistics.info.reduce((acc: number, cur: number) => acc + cur, 0) : 0}/>
                        </Col>
                        <Col span={6}>
                            <Statistic title={"重要"} valueStyle={{color: ColorWarn}}
                                       value={alarmStatistics ? alarmStatistics.warn.reduce((acc: number, cur: number) => acc + cur, 0) : 0}/>
                        </Col>
                        <Col span={6}>
                            <Statistic title={"紧急"} valueStyle={{color: ColorDanger}}
                                       value={alarmStatistics ? alarmStatistics.critical.reduce((acc: number, cur: number) => acc + cur, 0) : 0}/>
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
        <ShadowCard style={{marginTop: "8px"}} size={"small"}>
            <Row justify={"space-between"}>
                <Col span={6}>
                    <Title level={4}>设备视图</Title>
                </Col>
                <Col span={13} style={{textAlign: "right"}}>
                    <Space>
                        <Label name={"设备状态"}>
                            <Select bordered={false} value={deviceStatus} style={{width: "96px", textAlign: "left"}}
                                    onChange={(value: number) => {
                                        setDeviceStatus(value)
                                    }}>
                                <Option key={0} value={0}>全部</Option>
                                <Option key={1} value={1}>在线</Option>
                                <Option key={2} value={2}>离线</Option>
                                <Option value={3}>未入网</Option>
                            </Select>
                        </Label>
                        <Label name={"报警级别"}>
                            <Select bordered={false} mode={"multiple"} value={alertLevels} style={{width: "256px"}}
                                    onChange={(values: any) => {
                                        if (values.length) {
                                            setAlertLevels(values)
                                        } else {
                                            setAlertLevels([0, 1, 2, 3])
                                        }
                                    }}>
                                <Option key={0} value={0}>正常</Option>
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
                    <List size={"small"} dataSource={renderDatasource()}
                          grid={{column: 5}}
                          renderItem={(device: Device) => {
                              return <a href={`#/device-management/devices?locale=deviceDetail&id=${device.id}`}>
                                  <List.Item key={device.id}>
                                      <ShadowCard title={device.name} bordered={false} hoverable={true} size={"small"}
                                                  extra={device.alertState &&
                                                  <AlertIcon popoverPlacement={"top"} state={device.alertState}/>}>
                                          {
                                              renderDeviceCard(device)
                                          }
                                      </ShadowCard>
                                  </List.Item>
                              </a>
                          }}/>
                </Col>
            </Row>
        </ShadowCard>
    </>
}

export default AssetStatistic