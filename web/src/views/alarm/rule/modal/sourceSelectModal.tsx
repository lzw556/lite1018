import {
    Cascader,
    Col,
    ConfigProvider,
    Empty,
    Form,
    Modal,
    ModalProps,
    Pagination,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Typography
} from "antd";
import {FC, useEffect, useState} from "react";
import {defaultValidateMessages} from "../../../../constants/validator";
import {DeviceType} from "../../../../types/device_type";
import {GetPropertiesRequest} from "../../../../apis/property";
import {PagingDevicesRequest} from "../../../../apis/device";
import {Device} from "../../../../types/device";
import {PageResult} from "../../../../types/page";
import "../../../../string-extension";
import {ColorHealth, ColorWarn} from "../../../../constants/color";
import zhCN from "antd/es/locale/zh_CN";

const {TabPane} = Tabs;

export interface SourceSelectModalProps extends ModalProps {
    onSuccess?: (value:any) => void;
}

const SourceSelectModal: FC<SourceSelectModalProps> = (props) => {
    const {visible, onSuccess} = props;
    const [options, setOptions] = useState<any>([])
    const [properties, setProperties] = useState<any[]>([])
    const [property, setProperty] = useState<any>()
    const [dataSource, setDataSource] = useState<PageResult<Device[]>>()
    const [deviceType, setDeviceType] = useState<DeviceType>(0)
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [pagination, setPagination] = useState<any>({current: 1, size: 8,})
    const [sourceType, setSourceType] = useState<any>("device")
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            setOptions(DeviceType.Sensors().map(item => {
                return {value: item, label: DeviceType.toString(item), isLeaf: false}
            }))
        }
    }, [visible])

    const onDropdownRender = (options: any) => {
        return <Tabs defaultActiveKey={"device"} style={{padding: "0 10px 0 10px"}} onChange={setSourceType}>
            <TabPane tab={"设备"} key={"device"}>
                {options}
            </TabPane>
        </Tabs>
    }

    const onLoadData = (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        GetPropertiesRequest(targetOption.value).then(data => {
            targetOption.loading = false;
            targetOption.children = data.map(item => {
                return {value: item.key, label: item.name}
            })
            setProperties(data);
            setOptions([...options])
        }).catch(_ => {
            targetOption.loading = false;
        })
    }

    useEffect(() => {
        if (deviceType) {
            PagingDevicesRequest(pagination.current, pagination.size, {type: deviceType}).then(setDataSource);
        }
    }, [pagination, deviceType])

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: any) => {
            setSelectedRowKeys([...selectedKeys])
        }
    }

    const onOk = () => {
        if (onSuccess) {
            form.validateFields().then(values => {
                const selected = dataSource?.result.filter((item: Device) => selectedRowKeys.includes(item.macAddress)).map(item => {
                    return {
                        id: item.id,
                        name: item.name,
                    }
                })
                let metric = {
                    key: "",
                    name: "",
                }
                if (property && property.fields.length === 1) {
                    metric.key = property.key + "." + property.fields[0].key;
                    metric.name = property.name
                }else {
                    const field = property.fields.find((item:any) => item.key === values.dimension)
                    metric.key = metric.key = property.key + "." + field.key;
                    metric.name = `${property.name}(${field.name})`
                }

                onSuccess({sources: selected, metric:metric, sourceType: `${sourceType}::${deviceType}`})
            })
        }
    }

    const columns = [
        {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
            width: '12%',
            render: (state: any) => {
                return <Space>
                    {
                        state && state.isOnline ? <Tag color={ColorHealth}>在线</Tag> : <Tag color={ColorWarn}>离线</Tag>
                    }
                </Space>
            }
        },
        {
            title: '设备名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'MAC地址',
            dataIndex: 'macAddress',
            key: 'macAddress',
            render: (text: string) => text.toUpperCase().macSeparator(),
        }
    ]

    return <Modal {...props} title={"选择监控对象"} width={600} onOk={onOk}>
        <Form form={form} validateMessages={defaultValidateMessages} layout={"inline"}>
            <Form.Item label={"指标名称"} name={"index"}>
                <Cascader placeholder={"请选择指标名称"}
                          options={options}
                          loadData={onLoadData}
                          dropdownRender={onDropdownRender}
                          onChange={(values: any) => {
                              setDeviceType(values[0])
                              setProperty(properties.find((item: any) => item.key === values[values.length - 1]))
                          }}/>
            </Form.Item>
            {
                property && property.fields.length > 1 && <Form.Item label={"指标维度"} name={"dimension"}>
                    <Select placeholder={"请选择指标维度"}>
                        {
                            property.fields.map((item: any) => {
                                return <Select.Option key={item.key} value={item.key}>{item.name}</Select.Option>
                            })
                        }
                    </Select>
                </Form.Item>
            }
        </Form>
        <br/>
        <ConfigProvider renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"设备列表为空"}/>}
                        locale={zhCN}>
            <Table rowKey={record => record.macAddress} rowSelection={rowSelection} scroll={{y: 256}} columns={columns}
                   dataSource={dataSource?.result} pagination={false} size={"small"}/>
            <br/>
            <Row justify={"space-between"}>
                <Col span={12}>
                    <Typography.Text>已选中{selectedRowKeys.length}个设备</Typography.Text>
                </Col>
                <Col span={12}>
                    <Row justify={"end"}>
                        <Col>
                            {
                                dataSource?.total &&
                                <Pagination size="small" total={dataSource?.total} showSizeChanger
                                            current={pagination.current}
                                            pageSize={pagination.size}
                                            onChange={(page, pageSize) => {
                                                console.log(selectedRowKeys);
                                                setPagination({current: page, size: pageSize})
                                            }}/>
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </ConfigProvider>
    </Modal>
}

export default SourceSelectModal;