import {AssetStatistic} from "../../types/asset_statistic";
import {FC, useState} from "react";
import {Col, List, Row, Skeleton, Statistic,Typography} from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import ShadowCard from "../../components/shadowCard";
import {ColorDanger, ColorHealth} from "../../constants/color";
import {Device} from "../../types/device";

const {Title,Text} = Typography;

export interface AssetDashboardCardProps {
    values: AssetStatistic[]
}

const AssetDashboardCard:FC<AssetDashboardCardProps> = ({values}) => {
    const [height] = useState<number>(window.innerHeight - 388)

    const renderAssetStatisticCard = (statistic: AssetStatistic) => {
        const total = statistic.devices.length
        const online = statistic.devices.filter((device: Device) => device.state.isOnline).length
        const alert = statistic.devices.filter((device: Device) => device.alertState && device.alertState.level > 0).length
        return <Row justify={"start"}>
            <Col span={12}>
                <Statistic title={"报警设备"} value={alert} suffix={`/ ${total}`}/>
            </Col>
            <Col span={12}>
                <Statistic title={"在线设备"} value={online} suffix={`/ ${total}`}/>
            </Col>
        </Row>
    }

    const renderAssetStatus = (statistic: AssetStatistic) => {
        return statistic.status > 0 ?
            <Text style={{color: ColorDanger, fontWeight:"bold"}}>异常</Text> :
            <Text style={{color: ColorHealth, fontWeight:"bold"}}>正常</Text>
    }

    return <ShadowCard style={{margin: 4}}>
        <Title level={4}>资产视图</Title>
        <Row justify={"start"} style={{paddingTop: "4px"}}>
            <Col span={24}>
                <div
                    id="scrollableDiv"
                    style={{
                        height: `${height}px`,
                        overflow: 'auto',
                        border: '0px solid rgba(140, 140, 140, 0.35)',
                    }}
                >
                    <InfiniteScroll
                        dataLength={values.length}
                        hasMore={false}
                        loader={<Skeleton paragraph={{rows: 1}} active/>}
                        scrollableTarget="scrollableDiv"
                        style={{paddingTop: "8px"}}
                        next={() => {
                        }}>
                        <List size={"small"} dataSource={values}
                              grid={{column: 3}}
                              renderItem={(statistic: AssetStatistic) => {
                                  return <a href={`#/asset-management?locale=assetOverview&id=${statistic.asset.id}`}>
                                      <List.Item key={statistic.asset.id}>
                                          <ShadowCard title={statistic.asset.name} bordered={false} hoverable={true}
                                                      size={"small"} extra={renderAssetStatus(statistic)}>
                                              {
                                                  renderAssetStatisticCard(statistic)
                                              }
                                          </ShadowCard>
                                      </List.Item>
                                  </a>
                              }}/>
                    </InfiniteScroll>
                </div>
            </Col>
        </Row>
    </ShadowCard>
}

export default AssetDashboardCard