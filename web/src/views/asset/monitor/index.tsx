import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Button, Col, List, Popconfirm, Row, Space, Statistic, Tag, Typography} from "antd";
import AssetTreeSelect from "../../../components/select/assetTreeSelect";
import Label from "../../../components/label";
import ShadowCard from "../../../components/shadowCard";
import {Asset} from "../../../types/asset";
import {useEffect, useState} from "react";
import {GetAssetRequest} from "../../../apis/asset";
import AssetCanvas from "./assetCanvas";
import {Measurement} from "../../../types/measurement";
import {GetMeasurementRequest, GetMeasurementsRequest, RemoveMeasurementRequest} from "../../../apis/measurement";
import MeasurementStatistic from "./measurementStatistic";
import SensorStatistic from "./sensorStatistic";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";
import AlarmRecordStatistic from "./alarmRecordStatistic";
import {DeleteOutlined, EditOutlined, MonitorOutlined} from "@ant-design/icons";
import EditMeasurementModal from "./editMeasurementModal";
import {useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";
import moment from "moment";
import MeasurementDataViewModal from "./measurementDataViewModal";

const AssetMonitor = () => {
    const location = useLocation();
    const [asset, setAsset] = useState<Asset>();
    const [dataSource, setDataSource] = useState<Measurement[]>([]);
    const [measurement, setMeasurement] = useState<Measurement>();
    const selector = document.querySelector("#container")
    const [height] = useState<number>(window.innerHeight - 200)
    const [refreshKey, setRefreshKey] = useState(1)
    const id = GetParamValue(location.search, "id")
    const [isShowDataViewModal, setIsShowDataViewModal] = useState(false)

    useEffect(() => {
        if (asset) {
            GetMeasurementsRequest({asset_id: asset.id}).then(setDataSource)
        }
    }, [asset, refreshKey])

    const fetchAsset = (id: number) => {
        GetAssetRequest(id).then(setAsset)
    }

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onEdit = (id: number) => {
        GetMeasurementRequest(id).then(setMeasurement)
    }

    const onDelete = (id: number) => {
        RemoveMeasurementRequest(id).then(_ => onRefresh())
    }

    const renderMeasurementData = (m: Measurement) => {
        if (m.data) {
            if (m.data.fields) {
                const data = m.data.fields.filter(f => f.primary).sort((a, b) => a.sort - b.sort)[0]
                if (Array.isArray(data.value)) {
                    return <>
                        <Statistic title={`${data.title}(X轴)`} value={data.value[0]} suffix={data.unit} precision={data.precision}/>
                        <Typography.Text>{moment.unix(m.data.timestamp).local().format("YYYY-MM-DD hh:mm:ss")}</Typography.Text>
                    </>
                }
                return <>
                    <Statistic title={data.title} value={data.value} suffix={data.unit} precision={data.precision}/>
                    <Typography.Text>{moment.unix(m.data.timestamp).local().format("YYYY-MM-DD hh:mm:ss")}</Typography.Text>
                </>
            }
        }
        return <>
            <Statistic title={"暂无特征值属性"} value={"暂无数据"}/>
            <Typography.Text>-</Typography.Text>
        </>
    }

    const renderMeasurementStatus = (m: Measurement) => {
        switch (m.alert?.level) {
            case 1:
                return <Tag color={ColorInfo}>提示</Tag>
            case 2:
                return <Tag color={ColorWarn}>重要</Tag>
            case 3:
                return <Tag color={ColorDanger}>紧急</Tag>
            default:
                return <Tag color={ColorHealth}>正常</Tag>
        }
    }

    const onView = (m: Measurement) => {
        setIsShowDataViewModal(true)
        setMeasurement(m)
    }

    const renderMeasurementActions = (m: Measurement) => {
        return [
            <Button type={"text"} size={"small"} disabled={!m.data?.fields} onClick={() => onView(m)}><MonitorOutlined/></Button>,
            <Button type={"text"} size={"small"} onClick={() => onEdit(m.id)}><EditOutlined/></Button>,
            <Popconfirm placement="left" title="确认要删除该监测点吗?" onConfirm={() => onDelete(m.id)}
                        okText="删除" cancelText="取消">
                <Button type={"text"} size={"small"} danger><DeleteOutlined/></Button>
            </Popconfirm>
        ]
    }

    return <Content>
        <MyBreadcrumb>
            <Space style={{backgroundColor: "white"}}>
                <Label name={"资产"}>
                    <AssetTreeSelect bordered={false} style={{width: "150px"}}
                                     placeholder={"请选择资产"}
                                     defaultActiveFirstOption={true}
                                     defaultValue={Number(id)}
                                     value={asset?.id}
                                     onChange={fetchAsset}/>
                </Label>
            </Space>
        </MyBreadcrumb>
        <Row justify={"start"}>
            <Col xl={8} xxl={6}>
                <ShadowCard title={"监测点状态统计"} size={"small"} style={{height: "33%"}}>
                    <MeasurementStatistic asset={asset} style={{height: `${height / 3 - 20}px`}}/>
                </ShadowCard>
                <ShadowCard title={"传感器状态统计"} size={"small"} style={{height: "33%"}}>
                    {
                        asset && <SensorStatistic filter={{asset_id: asset.id}} style={{height: `${height / 3 - 20}px`}}/>
                    }
                </ShadowCard>
                <ShadowCard title={"今日报警统计"} size={"small"} style={{height: "33%"}}>
                    <AlarmRecordStatistic asset={asset}  />
                </ShadowCard>
            </Col>
            <Col xl={16} xxl={18} style={{paddingLeft: "8px"}}>
                <ShadowCard style={{height: "99%"}}>
                    <Typography.Title level={5}>资产示意图</Typography.Title>
                    <Row justify={"start"} style={{width: "100%"}} align={"middle"}>
                        <Col span={24}>
                            <div id={"container"} style={{width: "100%", height: `${height}px`}}>
                                {
                                    asset && selector &&
                                    <AssetCanvas width={selector.clientWidth}
                                                 height={selector.clientHeight}
                                                 asset={asset}
                                                 measurements={dataSource}/>
                                }
                            </div>
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
        <ShadowCard>
            <Typography.Title level={5}>监测点列表</Typography.Title>
            <Row justify={"start"} style={{overflow: "auto"}}>
                <Col span={24}>
                    <List size={"small"} dataSource={dataSource}
                          grid={{sm: 1, md: 2, lg: 3, xl: 4, xxl: 6}}
                          renderItem={measurement => {
                              return <List.Item key={measurement.id}>
                                  <ShadowCard size={"small"}
                                              title={<a href={`#/asset-management?locale=assetMonitor/measurementDetail&id=${measurement.id}`}>{measurement.name}</a>}
                                              extra={renderMeasurementStatus(measurement)}
                                              actions={renderMeasurementActions(measurement)}>
                                      {
                                          renderMeasurementData(measurement)
                                      }
                                  </ShadowCard>
                              </List.Item>
                          }}
                    />
                </Col>
            </Row>
        </ShadowCard>
        {
            measurement && !isShowDataViewModal && <EditMeasurementModal
                visible={!!measurement}
                measurement={measurement}
                onCancel={() => setMeasurement(undefined)}
                onSuccess={() => {
                    setMeasurement(undefined);
                    onRefresh();
                }}
            />
        }
        {
            measurement && isShowDataViewModal && <MeasurementDataViewModal measurement={measurement} visible={isShowDataViewModal}
                                                     onCancel={() => {
                                                         setMeasurement(undefined);
                                                         setIsShowDataViewModal(false);
                                                     }}/>
        }
    </Content>
}

export default AssetMonitor;