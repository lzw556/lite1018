import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Content} from "antd/es/layout/layout";
import {PlusOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {useCallback, useState} from "react";
import ShadowCard from "../../../components/shadowCard";
import {PagingPermissionsRequest} from "../../../apis/permission";
import AddPermissionModal from "./modal/add";

const PermissionPage = () => {
    const [addVisible, setAddVisible] = useState(false);

    const onChange = useCallback((current: number, size: number) => {
        PagingPermissionsRequest(current, size).then(res => {
            if (res.code === 200) {
            }
        })
    }, [])

    const onRefresh = () => {
    }

    const columns = [
        {
            title: '路径',
            dataIndex: 'path',
            key: 'path',
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '请求',
            dataIndex: 'method',
            key: 'method',
        }
    ]

    return <Content>
        <MyBreadcrumb>
            <Button type={"primary"} onClick={() => setAddVisible(true)}>添加权限 <PlusOutlined/></Button>
        </MyBreadcrumb>
        <ShadowCard>

        </ShadowCard>
        <AddPermissionModal visible={addVisible} onCancel={() => {setAddVisible(false)}} onSuccess={() => {
            setAddVisible(false)
            onRefresh()
        }}/>
    </Content>
}

export default PermissionPage