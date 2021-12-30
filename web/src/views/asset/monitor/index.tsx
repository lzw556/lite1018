import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Button, Col, Popconfirm, Row, Space, Tag, Typography} from "antd";
import AssetTreeSelect from "../../../components/select/assetTreeSelect";
import Label from "../../../components/label";
import ShadowCard from "../../../components/shadowCard";
import {Asset} from "../../../types/asset";
import {useEffect, useState} from "react";
import {GetAssetRequest} from "../../../apis/asset";
import AssetCanvas from "./assetCanvas";
import TableLayout from "../../layout/TableLayout";
import {Measurement} from "../../../types/measurement";
import {MeasurementType} from "../../../types/measurement_type";
import {GetMeasurementRequest, GetMeasurementsRequest, RemoveMeasurementRequest} from "../../../apis/measurement";
import MeasurementStatistic from "./measurementStatistic";
import SensorStatistic from "./sensorStatistic";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";
import AlarmRecordStatistic from "./alarmRecordStatistic";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import EditMeasurementModal from "./editMeasurementModal";
import {useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";

const AssetMonitor = () => {
    const location = useLocation();
    const [asset, setAsset] = useState<Asset>();
    const [dataSource, setDataSource] = useState<Measurement[]>([]);
    const [measurement, setMeasurement] = useState<Measurement>();
    const [height] = useState(window.innerHeight - 200)
    const selector = document.querySelector("#container")
    const [refreshKey, setRefreshKey] = useState(1)
    const id = GetParamValue(location.search, "id")

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

    const columns = [
        {
            title: '监测点名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Measurement) => {
                return <a
                    href={`#/asset-management?locale=assetMonitor/measurementDetail&id=${record.id}`}>{text}</a>
            }
        },
        {
            title: '监测点类型',
            dataIndex: 'type',
            key: 'type',
            render: (text: number) => MeasurementType.toString(text)
        },
        {
            title: '状态',
            dataIndex: 'alert',
            key: 'alert',
            render: (alert: any) => {
                switch (alert.level) {
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
        },
        {
            title: "操作",
            key: "action",
            render: (text: any, record: Measurement) => (
                <Space size="middle">
                    <Button type={"text"} size={"small"} onClick={() => onEdit(record.id)}><EditOutlined/></Button>
                    <Popconfirm placement="left" title="确认要删除该监测点吗?" onConfirm={() => onDelete(record.id)}
                                okText="删除" cancelText="取消">
                        <Button type={"text"} size={"small"} danger><DeleteOutlined/></Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ]

    return <Content style={{height: `${height}px`}}>
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
        <Row justify={"start"} style={{height: "100%"}}>
            <Col span={8}>
                <ShadowCard style={{height: "32%"}}>
                    <Typography.Title level={5}>监测点统计</Typography.Title>
                    <MeasurementStatistic asset={asset}/>
                </ShadowCard>
                <ShadowCard style={{height: "32%", marginTop: "2%"}}>
                    <Typography.Title level={5}>传感器统计</Typography.Title>
                    {
                        asset && <SensorStatistic filter={{asset_id: asset.id}} style={{height: "144px"}}/>
                    }
                </ShadowCard>
                <ShadowCard style={{height: "32%", marginTop: "2%"}}>
                    <Typography.Title level={5}>今日报警统计</Typography.Title>
                    <AlarmRecordStatistic asset={asset}/>
                </ShadowCard>
            </Col>
            <Col span={16} style={{paddingLeft: "8px"}}>
                <ShadowCard style={{height: "98%"}}>
                    <Typography.Title level={5}>资产示意图</Typography.Title>
                    <Row justify={"start"} style={{width: "100%"}}>
                        <Col span={24}>
                            <div id={"container"} style={{width: "100%"}}>
                                {
                                    asset && selector &&
                                    <AssetCanvas width={selector.clientWidth} height={selector?.clientWidth}
                                                 asset={asset} measurements={dataSource}/>
                                }
                            </div>
                        </Col>
                    </Row>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <TableLayout
                                emptyText={"监测点列表为空"}
                                columns={columns}
                                dataSource={dataSource}/>
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
        {
            measurement && <EditMeasurementModal
                visible={!!measurement}
                measurement={measurement}
                onCancel={() => setMeasurement(undefined)}
                onSuccess={() => {
                    setMeasurement(undefined);
                    onRefresh();
                }}
            />
        }
    </Content>
}

export default AssetMonitor;