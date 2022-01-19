import {FC, useCallback, useEffect, useState} from "react";
import {Button, Card, Col, ConfigProvider, List, Popconfirm, Row, Skeleton, Image} from "antd";
import {Content} from "antd/lib/layout/layout";
import {GetAssetRequest, PagingAssetsRequest, RemoveAssetRequest} from "../../apis/asset";
import {Asset} from "../../types/asset";
import {DeleteOutlined, EditOutlined, MonitorOutlined, PlusOutlined} from "@ant-design/icons";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";
import InfiniteScroll from "react-infinite-scroll-component";
import EditAssetModal from "./editAssetModal";
import AddAssetModal from "./addAssetModal";
import {EmptyLayout} from "../layout";
import {useHistory} from "react-router-dom";
import usePermission, {Permission} from "../../permission/permission";
import HasPermission from "../../permission";
import "./index.css";


const AssetPage: FC = () => {
    const {hasPermission} = usePermission();
    const [addVisible, setAddVisible] = useState(false);
    const [asset, setAsset] = useState<Asset>();
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [records, setRecords] = useState<Asset[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [current, setCurrent] = useState<number>(1);
    const [height] = useState(window.innerHeight - 180);
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const fetchAssets = useCallback((current: number, size: number) => {
        setIsLoading(true)
        PagingAssetsRequest(current, size).then(data => {
            setIsLoading(false)
            setRecords(data.result)
            setTotal(data.total)
            setCurrent(data.page)
        })
    }, [refreshKey])

    useEffect(() => {
        fetchAssets(1, 100)
    }, [fetchAssets])

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onDelete = async (id: number) => {
        RemoveAssetRequest(id).then(_ => onRefresh())
    }

    const onEdit = async (id: number) => {
        GetAssetRequest(id).then(setAsset)
    }

    const renderActions = (id: number) => {
        return [
            <Button type={"text"} icon={<MonitorOutlined/>} onClick={() => {
                history.push({pathname: "/asset-management", search: "?locale=assetMonitor", state: {id: id}})
            }}/>,
            <Button disabled={!hasPermission(Permission.AssetEdit)} type={"text"} icon={<EditOutlined/>} onClick={() => onEdit(id)}/>,
            <Popconfirm disabled={!hasPermission(Permission.AssetDelete)} title={"确定要删除吗"} okText={"删除"} cancelText={"取消"} onConfirm={() => onDelete(id)}>
                <Button disabled={!hasPermission(Permission.AssetDelete)} type={"text"} icon={<DeleteOutlined/>} danger/>
            </Popconfirm>
        ]
    }

    const renderAssetImage = (asset:Asset) => {
        if (asset && asset.image) {
            return <Row justify={"center"} align={"middle"} style={{height: "144px", padding: "0 4px", background: "rgba(190,190,190, 0.2)"}}>
                <Col>
                    <Image src={`/api/resources/assets/${asset.image}`} />
                </Col>
            </Row>
        }
        return <Row justify={"center"} align={"middle"} style={{height: "144px", padding: "0 4px", background: "rgba(190,190,190, 0.2)"}}>
            <Col>
                <Skeleton.Image className={"ant-skeleton-image"}/>
            </Col>
        </Row>
    }

    return <Content>
        <MyBreadcrumb>
            <HasPermission value={Permission.AssetAdd}>
                <Button type="primary" onClick={() => {
                    setAddVisible(true)
                }}>
                    添加资产 <PlusOutlined/>
                </Button>
            </HasPermission>
        </MyBreadcrumb>
        <ShadowCard>
            <div id="scrollableDiv"
                 style={{
                     height: `${height}px`,
                     overflow: 'auto',
                     border: '0px solid rgba(140, 140, 140, 0.35)',
                 }}>
                <ConfigProvider renderEmpty={() => <EmptyLayout description={"资产列表为空"}/>}>
                    <InfiniteScroll dataLength={records.length}
                                    hasMore={records.length < total}
                                    loader={<Skeleton paragraph={{rows: 1}} active={isLoading}/>}
                                    next={() => {
                                        fetchAssets(current + 1, 10)
                                    }}>
                        <List size={"small"} dataSource={records}
                              grid={{sm: 1, md: 2, lg: 3, xl: 4, xxl: 6}}
                              renderItem={asset => {
                                  return <List.Item key={asset.id}>
                                      <ShadowCard
                                          cover={renderAssetImage(asset)}
                                          actions={renderActions(asset.id)}
                                      >
                                          <Card.Meta title={asset.name}/>
                                      </ShadowCard>
                                  </List.Item>
                              }}
                        />
                    </InfiniteScroll>
                </ConfigProvider>
            </div>
        </ShadowCard>
        {
            asset && <EditAssetModal asset={asset} visible={!!asset}
                                     onCancel={() => setAsset(undefined)}
                                     onSuccess={() => {
                                         setAsset(undefined)
                                         onRefresh()
                                     }}
            />
        }
        <AddAssetModal
            visible={addVisible}
            onCancel={() => setAddVisible(false)}
            onSuccess={() => {
                setAddVisible(false)
                onRefresh()
            }}/>
    </Content>
}

export default AssetPage