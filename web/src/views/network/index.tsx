import {Content} from "antd/lib/layout/layout";
import {useCallback, useEffect, useState} from "react";
import {
    DeleteNetworkRequest,
    ExportNetworkRequest,
    GetNetworkRequest,
    PagingNetworksRequest,
    NetworkSyncRequest, NetworkProvisionRequest
} from "../../apis/network";
import ShadowCard from "../../components/shadowCard";
import "./index.css"
import MyBreadcrumb from "../../components/myBreadcrumb";
import TableLayout from "../layout/TableLayout";
import AddNetworkModal from "./modal/addNetworkModal";
import {Button, Col, Dropdown, Menu, message, Popconfirm, Row, Space} from "antd";
import {CodeOutlined, DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {Network} from "../../types/network";
import EditNetworkModal from "./modal/editNetworkModal";
import moment from "moment";
import {PageResult} from "../../types/page";
import usePermission, {Permission} from "../../permission/permission";
import HasPermission from "../../permission";
import { isMobile } from "../../utils/deviceDetection";
import { Link, useLocation } from "react-router-dom";
import { PagedOption } from "../../types/props";

const NetworkPage = () => {
    const { state } = useLocation<{pagedOptions: PagedOption}>();
    const pagedOptionsDefault = { index: 1, size: 10 };
    const [pagedOptions, setPagedOptions] = useState(state ? state.pagedOptions : pagedOptionsDefault);
    const {hasPermission, hasPermissions} = usePermission();
    const [addVisible, setAddVisible] = useState<boolean>(false)
    const [editVisible, setEditVisible] = useState<boolean>(false)
    const [network, setNetwork] = useState<Network>()
    const [dataSource, setDataSource] = useState<PageResult<any>>()
    const [refreshKey, setRefreshKey] = useState<number>(0)

    useEffect(() => {
        const {index, size} = pagedOptions;
        PagingNetworksRequest({}, index, size).then(setDataSource)
    }, [pagedOptions, refreshKey])

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onDelete = (id: number) => {
        DeleteNetworkRequest(id).then(() => {
            onRefresh()
        })
    }

    const onCommand = (record: Network, key: any) => {
        switch (key) {
            case "0":
                NetworkSyncRequest(record.id).then(res => {
                    if (res.code === 200) {
                        message.success("发送成功");
                    } else {
                        message.error(`发送失败: ${res.msg}`);
                    }
                })
                break
            case "1":
                NetworkProvisionRequest(record.id).then(res => {
                    if (res.code === 200) {
                        message.success("发送成功");
                    } else {
                        message.error(`发送失败: ${res.msg}`);
                    }
                })
                break
            case "2":
                exportNetwork(record)
                break
        }
    }

    const exportNetwork = (n: Network) => {
        ExportNetworkRequest(n.id).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${n.name}.json`)
            document.body.appendChild(link)
            link.click()
        });
    }

    const renderCommandMenus = (record: Network) => {
        return <Menu onClick={(e) => {
            onCommand(record, e.key)
        }}>
            {
                hasPermission(Permission.NetworkSync) && <Menu.Item key={0}>同步网络</Menu.Item>
            }
            {
                hasPermission(Permission.NetworkProvision) && <Menu.Item key={1}>继续组网</Menu.Item>
            }
            {
                hasPermission(Permission.NetworkExport) && <Menu.Item key={2}>导出网络</Menu.Item>
            }
        </Menu>
    }

    const onEdit = (id: number) => {
        GetNetworkRequest(id).then(data => {
            setNetwork(data)
            setEditVisible(true)
        })
    }

    const columns = [
        {
            title: '网络名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Network) => {
                if (hasPermission(Permission.NetworkDetail)) {
                    return <Link to={{pathname:`network-management`, search: `?locale=networks/networkDetail&id=${record.id}` ,state: {pagedOptions}}}>{text}</Link>
                }
                return text
            }
        },
        {
            title: '通讯周期',
            dataIndex: 'communicationPeriod',
            key: 'communicationPeriod',
            render: (text: number, record: Network) => {
                return moment.duration(text / 1000, 'seconds').humanize()
            }
        },
        {
            title: '通讯延时',
            dataIndex: 'communicationOffset',
            key: 'communicationOffset',
            render: (text: number, record: Network) => {
                if (text === 0) {
                    return '无'
                }
                if (text / 1000 < 60) {
                    return `${text / 1000}秒`
                }
                return moment.duration(text / 1000, 'seconds').humanize()
            }
        },
        {
            title: '每组设备数',
            dataIndex: 'groupSize',
            key: 'groupSize',
        },
        {
            title: '每组通讯间隔',
            dataIndex: 'groupInterval',
            key: 'groupInterval',
            render: (text: number) => {
                return moment.duration(text / 1000, 'seconds').humanize()
            }
        },
        // {
        //     title: '模式',
        //     dataIndex: 'mode',
        //     key: 'mode',
        //     render: (mode: number) => {
        //         return mode === 1 ? '云端模式' : '本地模式'
        //     }
        // },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => (
                <Space size={"middle"}>
                    {
                        hasPermission(Permission.NetworkEdit) &&
                        <Button type="text" size="small" icon={<EditOutlined/>} onClick={() => onEdit(record.id)}/>
                    }
                    {
                        <Dropdown overlay={renderCommandMenus(record)}>
                            <Button type="text" icon={<CodeOutlined/>} hidden={!(hasPermission(Permission.NetworkExport) || hasPermissions(Permission.NetworkSync) || hasPermission(Permission.NetworkProvision))}/>
                        </Dropdown>
                    }
                    {
                        hasPermission(Permission.NetworkDelete) &&
                        <Popconfirm placement="left" title="确认要删除该设备吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    }
                </Space>
            ),
        }
    ]

    return <Content>
        <MyBreadcrumb>
            <HasPermission value={Permission.NetworkAdd}>
                <Space>
                    <Button type={"primary"} onClick={() => setAddVisible(true)}>添加网络<PlusOutlined/></Button>
                </Space>
            </HasPermission>
        </MyBreadcrumb>
        <ShadowCard>
            <Row justify={"start"}>
                <Col span={24}>
                    <TableLayout emptyText={"网络列表为空"}
                                 permissions={[Permission.NetworkEdit, Permission.NetworkExport, Permission.NetworkDelete]}
                                 columns={columns}
                                 dataSource={dataSource}
                                 onPageChange={(index, size) => setPagedOptions({index, size})}
                                 simple={isMobile}
                                 scroll={isMobile ? {x: 800} : undefined}/>
                </Col>
            </Row>
        </ShadowCard>
        <AddNetworkModal visible={addVisible}
                         onCancel={() => setAddVisible(false)}
                         onSuccess={() => {
                             setAddVisible(false)
                             onRefresh()
                         }}/>
        {
            network && <EditNetworkModal
                visible={editVisible}
                network={network}
                onCancel={() => setEditVisible(false)}
                onSuccess={() => {
                    setEditVisible(false)
                    onRefresh()
                }}/>
        }
    </Content>
}

export default NetworkPage