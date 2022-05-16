import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../components/myBreadcrumb";
import ShadowCard from "../../components/shadowCard";
import TableLayout from "../layout/TableLayout";
import {Button, Popconfirm, Space} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {useCallback, useEffect, useState} from "react";
import {PageResult} from "../../types/page";
import {DeleteProjectRequest, PagingProjectsRequest} from "../../apis/project";
import EditProjectModal from "./editProjectModal";
import {Project} from "../../types/project";
import AllocUserDrawer from "./allocUserDrawer";
import {store} from "../../store";
import HasPermission from "../../permission";
import usePermission, {Permission} from "../../permission/permission";

const ProjectPage = () => {
    const [visible, setVisible] = useState(false);
    const [allocVisible, setAllocVisible] = useState(false);
    const [dataSource, setDataSource] = useState<PageResult<any>>();
    const [refreshKey, setRefreshKey] = useState(0);
    const [project, setProject] = useState<Project>();
    const {hasPermissions} = usePermission();

    const fetchProjects = useCallback((current: number, size: number) => {
        PagingProjectsRequest(current, size).then(setDataSource);
    }, [refreshKey]);

    useEffect(() => {
        fetchProjects(1, 10);
    }, [fetchProjects]);

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1);
    };

    const onAllocUser = (record: Project) => {
        setAllocVisible(true);
        setProject(record);
    }

    const onEdit = (record: Project) => {
        setProject(record);
        setVisible(true);
    };

    const onDelete = (id: number) => {
        DeleteProjectRequest(id).then(() => {
            store.dispatch({
                type: "SET_PROJECT",
                payload: 0
            });
            window.location.reload();
        });
    };

    const columns = [
        {
            title: '项目名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: "描述",
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '操作',
            key: 'action',
            width: "20%",
            render: (_: any, record: any) => {
                return <Space>
                    {
                        hasPermissions(Permission.ProjectAllocUser, Permission.ProjectAllocUserGet) &&
                        <Button type={"link"} size={"small"} onClick={() => onAllocUser(record)}>分配用户</Button>
                    }
                    <HasPermission value={Permission.ProjectEdit}>
                        <Button type={"text"} size={"small"} onClick={() => onEdit(record)}><EditOutlined/></Button>
                    </HasPermission>
                    <HasPermission value={Permission.ProjectDelete}>
                        <Popconfirm title={"确定要删除该项目吗?"} onConfirm={() => onDelete(record.id)}>
                            <Button type={"text"} size={"small"} danger><DeleteOutlined/></Button>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            }
        }
    ]

    return <Content>
        <MyBreadcrumb>
            <HasPermission value={Permission.ProjectAdd}>
                <Space>
                    <Button type={"primary"} onClick={() => setVisible(true)}>添加项目<PlusOutlined/></Button>
                </Space>
            </HasPermission>
        </MyBreadcrumb>
        <ShadowCard>
            <TableLayout
                emptyText={"项目列表为空"}
                permissions={[Permission.ProjectEdit, Permission.ProjectDelete, Permission.ProjectAllocUserGet, Permission.ProjectAllocUser]}
                dataSource={dataSource}
                onPageChange={fetchProjects}
                columns={columns}/>
        </ShadowCard>
        {
            visible && <EditProjectModal visible={visible}
                                         project={project}
                                         onSuccess={() => {
                                             setVisible(false);
                                             setProject(undefined);
                                             onRefresh();
                                         }}
                                         onCancel={() => {
                                             setVisible(false);
                                             setProject(undefined);
                                         }}/>
        }
        {
            allocVisible && project && <AllocUserDrawer project={project}
                                                        visible={allocVisible}
                                                        onSuccess={() => {
                                                            setAllocVisible(false);
                                                            setProject(undefined);
                                                        }}
                                                        onClose={() => {
                                                            setAllocVisible(false);
                                                            setProject(undefined);
                                                        }}/>
        }
    </Content>
}

export default ProjectPage;