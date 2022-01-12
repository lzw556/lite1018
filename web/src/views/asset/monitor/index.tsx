import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Button, Col, ConfigProvider, List, Popconfirm, Row, Space, Statistic, Tag, Typography} from "antd";
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
import {DeleteOutlined, EditOutlined, MonitorOutlined} from "@ant-design/icons";
import EditMeasurementModal from "./editMeasurementModal";
import {useLocation} from "react-router-dom";
import moment from "moment";
import MeasurementDataViewModal from "./measurementDataViewModal";
import {EmptyLayout} from "../../layout";
import AlertStatistic from "../measurement/detail/alertStatistic";
import usePermission, {Permission} from "../../../permission/permission";

const AssetMonitor = () => {
    const {hasPermission} = usePermission();
    const location = useLocation<any>();
    const [asset, setAsset] = useState<Asset>();
    const [dataSource, setDataSource] = useState<Measurement[]>([]);
    const [measurement, setMeasurement] = useState<Measurement>();
    const selector = document.querySelector("#container")
    const [height] = useState<number>(window.innerHeight - 200)
    const [refreshKey, setRefreshKey] = useState(1)
    const [isShowDataViewModal, setIsShowDataViewModal] = useState(false)
    const id = location.state?.id ? Number(location.state.id) : undefined

    useEffect(() => {
        if (asset) {
            hasPermission(Permission.MeasurementList) && GetMeasurementsRequest({asset_id: asset.id}).then(setDataSource)
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
                        <Statistic title={`${data.title}(X轴)`} value={data.value[0]} suffix={data.unit}
                                   precision={data.precision}/>
                        <Typography.Text>{moment.unix(m.data.timestamp).local().format("YYYY-MM-DD HH:mm:ss")}</Typography.Text>
                    </>
                }
                return <>
                    <Statistic title={data.title} value={data.value} suffix={data.unit} precision={data.precision}/>
                    <Typography.Text>{moment.unix(m.data.timestamp).local().format("YYYY-MM-DD HH:mm:ss")}</Typography.Text>
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
            <Button disabled={!hasPermission(Permission.MeasurementEdit)} type={"text"} size={"small"} onClick={() => onEdit(m.id)}><EditOutlined/></Button>,
            <Popconfirm disabled={!hasPermission(Permission.MeasurementDelete)} placement="left" title="确认要删除该监测点吗?" onConfirm={() => onDelete(m.id)}
                        okText="删除" cancelText="取消">
                <Button disabled={!hasPermission(Permission.MeasurementDelete)} type={"text"} size={"small"} danger><DeleteOutlined/></Button>
            </Popconfirm>
        ]
    }

    const renderMeasurementTitle = (m: Measurement) => {
        if (hasPermission(Permission.MeasurementDetail)) {
            return <a
                href={`#/asset-management?locale=assetMonitor/measurementDetail&id=${m.id}`}>{m.name}</a>
        }
        return m.name
    }

    return <Content>
        <MyBreadcrumb>
            <Space style={{backgroundColor: "white"}}>
                <Label name={"资产"}>
                    <AssetTreeSelect bordered={false} style={{width: "150px"}}
                                     placeholder={"请选择资产"}
                                     defaultActiveFirstOption={true}
                                     defaultValue={id}
                                     value={asset?.id}
                                     onChange={fetchAsset}/>
                </Label>
            </Space>
        </MyBreadcrumb>
        <Row justify={"start"}>
            <Col xl={8} xxl={6}>
                <ShadowCard bodyStyle={{height: `${height / 3}px`, position: "relative"}}
                            title={<Typography.Title level={5}>监测点状态统计</Typography.Title>} size={"small"}>
                    <MeasurementStatistic asset={asset} style={{height: `${height / 4}px`}}/>
                </ShadowCard>
                <ShadowCard bodyStyle={{height: `${height / 3}px`, position: "relative", marginTop: "2px"}}
                            title={<Typography.Title level={5}>传感器状态统计</Typography.Title>} size={"small"}>
                    {
                        asset && selector &&
                        <SensorStatistic filter={{asset_id: asset.id}} style={{height: `${height / 4}px`}}/>
                    }
                </ShadowCard>
                <ShadowCard bodyStyle={{height: `${height / 3}px`, position: "relative", marginTop: "2px"}}
                            size={"small"}
                            title={<Typography.Title level={5}>一周报警统计</Typography.Title>}>
                    {
                        asset &&
                        <AlertStatistic filter={{asset_id: asset.id}} style={{height: `${height / 4}px`}}/>
                    }
                </ShadowCard>
            </Col>
            <Col xl={16} xxl={18}>
                <ShadowCard style={{height: "100%", position: "relative"}} bodyStyle={{height: "100%"}}
                            title={<Typography.Title level={5}>资产示意图</Typography.Title>} size={"small"}>
                    <Row justify={"start"} style={{height: "100%", position: "relative"}}>
                        <Col id={"container"} span={24} style={{height: "90%", position: "relative"}}>
                            {
                                asset && selector &&
                                <AssetCanvas width={selector.clientWidth}
                                             height={selector.clientHeight}
                                             asset={asset}
                                             measurements={dataSource}/>
                            }
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={24}>
                <ShadowCard size={"small"} title={<Typography.Title level={5}>监测点列表</Typography.Title>}>
                    <Row justify={"start"} style={{overflow: "auto"}}>
                        <Col span={24}>
                            <ConfigProvider renderEmpty={() => <EmptyLayout description={"监测点列表为空"}/>}>
                                <List size={"small"} dataSource={dataSource}
                                      grid={{sm: 1, md: 2, lg: 3, xl: 4, xxl: 6}}
                                      renderItem={measurement => {
                                          return <List.Item key={measurement.id}>
                                              <ShadowCard size={"small"}
                                                          title={renderMeasurementTitle(measurement)}
                                                          extra={renderMeasurementStatus(measurement)}
                                                          actions={renderMeasurementActions(measurement)}>
                                                  {
                                                      renderMeasurementData(measurement)
                                                  }
                                              </ShadowCard>
                                          </List.Item>
                                      }}
                                />
                            </ConfigProvider>
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
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
            measurement && isShowDataViewModal &&
            <MeasurementDataViewModal measurement={measurement} visible={isShowDataViewModal}
                                      onCancel={() => {
                                          setMeasurement(undefined);
                                          setIsShowDataViewModal(false);
                                      }}/>
        }
    </Content>
}

export default AssetMonitor;