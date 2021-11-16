import {Button, Col, message, Popconfirm, Row, Space, Upload} from "antd";
import {DeleteOutlined, UploadOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {useCallback, useState} from "react";
import TableLayout, {DEFAULT_TABLE_PROPS, TableProps} from "../layout/TableLayout";
import {PagingFirmwaresRequest, RemoveFirmwareRequest, UploadFirmwareRequest} from "../../apis/firmware";
import moment from "moment";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";


const FirmwarePage = () => {
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [table, setTable] = useState<TableProps>(DEFAULT_TABLE_PROPS)

    const onFileChange = (info:any) => {
        if (info.file.status === 'uploading') {
            setIsUploading(true)
        }
    }

    const onUpload = (options:any) => {
        const formData = new FormData()
        formData.append("file", options.file)
        UploadFirmwareRequest(formData).then(res => {
            setIsUploading(false)
            if (res.code === 200) {
                onRefresh()
                message.success("固件上传成功").then()
            }else {
                message.error(`上传失败,${res.msg}`).then()
            }
        })
    }

    const onLoading = (isLoading: boolean) => {
        setTable(old => Object.assign({}, old, {isLoading: isLoading}))
    }

    const onChange = useCallback((current: number, size: number) => {
        onLoading(true)
        PagingFirmwaresRequest(current, size).then(res => {
            onLoading(false)
            if (res.code === 200) {
                setTable(old => Object.assign({}, old, {data: res.data}))
            }
        })
    }, [])

    const onRefresh = () => {
        setTable(old => Object.assign({}, old, {refreshKey: old.refreshKey + 1}))
    }

    const onDelete = async (id:number) => {
        const res = await RemoveFirmwareRequest(id)
        if (res.code === 200) {
            onRefresh()
            message.success("删除成功").then()
        }else {
            message.error("删除失败").then()
        }
    }

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '软件版本',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: '硬件版本',
            dataIndex: 'productId',
            key: 'productId'
        },
        {
            title: 'CRC',
            dataIndex: 'crc',
            key: 'crc'
        },
        {
            title: '编译时间',
            dataIndex: 'buildTime',
            key: 'buildTime',
            render: (text:number) => moment.unix(text).local().format("yyyy-MM-DD HH:mm:ss")
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => (
                <Space>
                    <Popconfirm placement="left" title="确认要删除该用户吗?" onConfirm={() => onDelete(record.id)}
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" icon={<DeleteOutlined />} danger/>
                    </Popconfirm>
                </Space>
            ),
        }
    ]

    return <Content>
        <MyBreadcrumb items={["设备管理", "固件列表"]}>
            <Upload
                accept={".bin"}
                name="file"
                customRequest={onUpload}
                showUploadList={false}
                onChange={onFileChange}>
                <Button type="primary" loading={isUploading}>
                    {
                        isUploading ? "固件上传中" : "上传固件"
                    }
                    {
                        isUploading ? null : <UploadOutlined />
                    }
                </Button>
            </Upload>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                    <ShadowCard>
                        <TableLayout
                            emptyText={"固件列表为空"}
                            columns={columns}
                            isLoading={table.isLoading}
                            refreshKey={table.refreshKey}
                            onChange={onChange}
                            pagination={true}
                            data={table.data}/>
                    </ShadowCard>
            </Col>
        </Row>
    </Content>
}

export default FirmwarePage