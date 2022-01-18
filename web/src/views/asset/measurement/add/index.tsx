import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../../components/myBreadcrumb";
import ShadowCard from "../../../../components/shadowCard";
import {Button, Col, Divider, Form, Result, Row, Space, Steps} from "antd";
import {useState} from "react";
import BaseInfoFormItem from "./baseInfoFormItem";
import {defaultValidateMessages, Rules} from "../../../../constants/validator";
import {AddMeasurementRequest} from "../../../../apis/measurement";
import DeviceTypeSelect from "../../../../components/select/deviceTypeSelect";
import {MeasurementType} from "../../../../types/measurement_type";
import DeviceMacAddressSelect from "../../../../components/select/deviceMacAddressSelect";
import AcquisitionModeSelect from "../../../../components/select/acquisitionModeSelect";
import CommunicationPeriodSelect from "../../../../components/communicationPeriodSelect";
import {GetDefaultDeviceSettingsRequest} from "../../../../apis/device";
import {DeviceSetting} from "../../../../types/device_setting";
import DeviceSettingFormItem from "../../../../components/formItems/deviceSettingFormItem";

const {Step} = Steps;

const AddMeasurement = () => {
    const [current, setCurrent] = useState<number>(0)
    const [type, setType] = useState<MeasurementType>()
    const [mode, setMode] = useState<any>(0)
    const [params, setParams] = useState<any>({})
    const [success, setSuccess] = useState<boolean>(false)
    const [settings, setSettings] = useState<DeviceSetting[]>([])
    const [id, setId] = useState<any>()
    const [form] = Form.useForm()

    const steps = [
        {
            title: "基本信息",
        },
        {
            title: "关联设备",
        }
    ]

    const onNext = () => {
        form.validateFields().then(values => {
            Object.keys(values).forEach(key => {
                params[key] = values[key]
            })
            setParams(params)
            setType(values.type)
            setCurrent(current + 1)
        })
    }

    const onAdd = () => {
        form.validateFields().then(values => {
            Object.keys(values).forEach(key => {
                params[key] = values[key]
            })
            AddMeasurementRequest(params).then(data => {
                setId(data)
                setSuccess(true)
            })
        })
    }

    const renderDeviceSettingItems = () => {
        return settings.map(setting => {
            return <DeviceSettingFormItem value={setting}/>
        })
    }

    const onDeviceTypeChange = (value: any) => {
        GetDefaultDeviceSettingsRequest(value).then(data => {
            setSettings(data)
        })
    }

    const renderDeviceBindingItem = () => {
        const sensors = MeasurementType.toDeviceType(type)
        return <>
            <Divider orientation={"left"} plain>设备绑定</Divider>
            <Form.Item label={"设备类型"} name={"device_type"} rules={[Rules.required]}>
                <DeviceTypeSelect sensors={sensors} onChange={onDeviceTypeChange}/>
            </Form.Item>
            <Form.Item label={"MAC地址"} name={"binding_devices"} rules={[Rules.required]}>
                <DeviceMacAddressSelect type={type} settings={params.settings}/>
            </Form.Item>
            <Row justify={"center"}>
                <Col span={24}>
                    <Divider orientation={"left"} plain>参数配置</Divider>
                    {
                        type &&
                        <Form.Item label={"采集方式"} name={"acquisition_mode"} rules={[Rules.required]}>
                            <AcquisitionModeSelect placeholder={"请选择监测点采集方式"} type={type} onChange={setMode}/>
                        </Form.Item>
                    }
                    {
                        mode === 1 && <Form.Item label={"轮询周期"} name={"polling_period"} rules={[Rules.required]}>
                            <CommunicationPeriodSelect placeholder={"请选择轮询周期"}/>
                        </Form.Item>
                    }
                </Col>
            </Row>
        </>
    }

    return <Content>
        <MyBreadcrumb/>
        <ShadowCard>
            {
                success && (<Result
                    status="success"
                    title="监测点创建成功!"
                    subTitle="您可以查看监测点信息或者继续创建监测点"
                    extra={[
                        <Button key="add" onClick={() => {
                            form.resetFields()
                            setCurrent(0)
                            setSuccess(false)
                        }}>继续创建</Button>,
                        <Button key="detail" type={"primary"} onClick={() => {
                            window.location.hash = `asset-management?locale=assetMonitor/measurementDetail&id=${id}`
                        }}>查看监测点</Button>
                    ]}
                />)
            }
            {
                !success && <Row justify={"start"}>
                    <Col span={24}>
                        <Row justify={"start"}>
                            <Col span={12}>
                                <Steps
                                    current={current}
                                    className="site-navigation-steps"
                                    type="navigation"
                                    size="small">
                                    {
                                        steps.map(item => <Step key={item.title} title={item.title}/>)
                                    }
                                </Steps>
                            </Col>
                        </Row>
                        <Row justify={"start"}>
                            <Col span={12}>
                                <Form form={form} labelCol={{xl: 8, xxl:6}} wrapperCol={{xl: 14, xxl: 12}} validateMessages={defaultValidateMessages}>
                                    {
                                        current === 0 &&
                                        <BaseInfoFormItem form={form} type={type} onTypeChange={setType}/>
                                    }
                                    {
                                        current === 1 && <>
                                            {
                                                renderDeviceBindingItem()
                                            }
                                            {
                                                renderDeviceSettingItems()
                                            }
                                        </>
                                    }
                                </Form>
                                <Row justify={"start"}>
                                    <Col span={24} style={{textAlign: "right"}}>
                                        <Space>
                                            {
                                                current < steps.length - 1 && (
                                                    <Button type="primary" onClick={onNext}>下一步</Button>)
                                            }
                                            {
                                                current > 0 && (
                                                    <Button onClick={() => setCurrent(current - 1)}>上一步</Button>)
                                            }
                                            {
                                                current === steps.length - 1 && (
                                                    <Button type="primary" onClick={onAdd}>完成</Button>)
                                            }
                                        </Space>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={12} style={{textAlign: "center"}}>

                            </Col>
                        </Row>
                    </Col>
                </Row>
            }
        </ShadowCard>
    </Content>
}

export default AddMeasurement;