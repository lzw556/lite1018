import ShadowCard from "../../../components/shadowCard";
import {Card, Carousel, Col, List, Row, Skeleton, Statistic, Tag} from "antd";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import {Device} from "../../../types/device";
import {ColorDanger, ColorHealth, ColorWarn} from "../../../constants/color";
import InfiniteScroll from "react-infinite-scroll-component";
import {AssetStatistic} from "../../../types/asset_statistic";
import {FC, useState} from "react";
import {DeviceType, DeviceTypeString} from "../../../types/device_type";
import {GetPrimaryProperty} from "../../../types/property";
import {GetFieldName} from "../../../constants/field";
import "../index.css";

export interface AssetStatisticsProps {
    values?: AssetStatistic[]
}

const AssetStatistics:FC<AssetStatisticsProps> = ({values}) => {
    const [height] = useState<number>(window.innerHeight - 416)

    const renderDeviceCard = (device: Device) => {
        if (device.typeId !== DeviceType.Gateway && device.typeId !== DeviceType.Router) {
            const property = GetPrimaryProperty(device.properties, device.typeId)
            if (property) {
                if (property.data && Object.keys(property.data.fields).length) {
                    const field = Object.keys(property.data.fields)[0]
                    return <Statistic title={GetFieldName(field)} valueStyle={{color: device.state.alertLevel === 3 ? ColorDanger : ColorHealth}} value={Number(property.data.fields[field]).toFixed(3)} suffix={property.unit}/>
                }else {
                    return <Statistic title={property.name} value={"暂无数据"}/>
                }
            }
        }else {
            return <Statistic title={DeviceTypeString(device.typeId)} valueStyle={{color: device.state.isOnline ? ColorHealth : ColorWarn}} value={device.state.isOnline ? "在线" : "离线"}/>
        }
    }

    return  <ShadowCard style={{margin: 4}}>
        <Carousel prevArrow={<LeftOutlined/>} nextArrow={<RightOutlined/>}
                  arrows={true} dotPosition={"bottom"} dots={{className: "ts-carousel-color"}}>
            {
                values && values.map((item: any, index: number) => {
                    const total = item.devices.length
                    const online = item.devices.filter((device: Device) => device?.state.isOnline).length
                    const alert = item.devices.filter((device: Device) => device?.state.alertLevel === 3).length
                    const noAccess = item.devices.filter((device: Device) => device?.accessState === 0).length
                    return <div key={index}>
                        <Row justify={"start"} style={{textAlign: "center"}}>
                            <Col span={6}>
                                <Statistic title={"资产名称"} value={item.asset.name} valueStyle={{
                                    color: `${item.status ? ColorDanger : ColorHealth}`,
                                    fontWeight: "bold"
                                }}/>
                            </Col>
                            <Col span={4}>
                                <Statistic title={"设备总数"} value={total}/>
                            </Col>
                            <Col span={4}>
                                <Statistic title={"在线设备数"} value={online} valueStyle={{color: ColorHealth}}
                                           suffix={`/ ${total}`}/>
                            </Col>
                            <Col span={4}>
                                <Statistic title={"报警设备数"} value={alert} valueStyle={{color: ColorDanger}}
                                           suffix={`/ ${total}`}/>
                            </Col>
                            <Col span={4}>
                                <Statistic title={"未入网设备"} value={noAccess} valueStyle={{color: ColorWarn}}
                                           suffix={`/ ${total}`}/>
                            </Col>
                        </Row>
                        <Row justify={"start"} style={{paddingTop: "4px"}}>
                            <Col span={24}>
                                <div
                                    id="scrollableDiv"
                                    style={{
                                        height: `${height}px`,
                                        overflow: 'auto',
                                        paddingTop: "8px",
                                        paddingLeft: "44px",
                                        paddingRight: "44px",
                                        border: '0px solid rgba(140, 140, 140, 0.35)',
                                    }}
                                >
                                    <InfiniteScroll
                                        dataLength={item.devices.length}
                                        hasMore={false}
                                        loader={<Skeleton paragraph={{rows: 1}} active/>}
                                        scrollableTarget="scrollableDiv"
                                        style={{paddingTop: "8px"}}
                                        next={() => {
                                        }}>
                                        <List size={"small"} dataSource={item.devices}
                                              grid={{column: 4 }}
                                              renderItem={(device: Device) => {
                                                  return <List.Item key={device.id}>
                                                      <ShadowCard bordered={false} hoverable={true} size={"small"}>
                                                          <Card.Meta avatar={() => {
                                                              return device.state.isOnline ?
                                                                  <Tag color={ColorHealth}>在线</Tag> :
                                                                  <Tag color={ColorWarn}>离线</Tag>
                                                          }} title={device.name} description={""}/>
                                                          {
                                                              renderDeviceCard(device)
                                                          }
                                                      </ShadowCard>
                                                  </List.Item>
                                              }}/>
                                    </InfiniteScroll>
                                </div>
                            </Col>
                        </Row>
                    </div>
                })
            }
        </Carousel>
    </ShadowCard>
}

export default AssetStatistics