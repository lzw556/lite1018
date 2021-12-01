import {Button, Col, Form, Result, Row, Space, Steps} from "antd";
import {Content} from "antd/es/layout/layout";
import {useState} from "react";
import BaseInfoForm from "../form/baseInfoForm";
import DeviceTypeForm from "../form/deviceTypeForm";
import "../index.css"
import {DeviceType} from "../../../types/device_type";
import {SensorSettingKeys} from "../form/item/sensorFormItem";
import {PretighteningSettings} from "../form/item/pretighteningFormItem";
import {LengthRodSettings} from "../form/item/lengthRodFormItem";
import {SpeedObjectSettings} from "../form/item/speedObjectFormItem";
import {AddDeviceRequest} from "../../../apis/device";
import {IPNSettingKeys} from "../form/item/ipnFormItem";
import {WSNSettingKeys} from "../form/item/wsnFormItem";
import ShadowCard from "../../../components/shadowCard";
import MyBreadcrumb from "../../../components/myBreadcrumb";



interface RequestForm {
    name: string
    mac_address: string
    type_id:number
    asset_id:number
    parent_id?:number | 0
    ipn?:{}
    sensors?:{}
    system?:{}
    wsn?:{}
}

const {Step} = Steps

const AddDevicePage = () => {
    const [current, setCurrent] = useState<number>(0)
    const [requestForm, setRequestForm] = useState<RequestForm>({name: "", mac_address: "", type_id: 0, asset_id: 0})
    const [deviceType, setDeviceType] = useState<DeviceType>()
    const [success, setSuccess] = useState<boolean>(false)
    const [form] = Form.useForm()
    const steps = [
        {
            title: "基本信息",
        },
        {
            title: "选择设备类型",
        }
    ]

    const onChange = (value:DeviceType) => {
        delete requestForm.ipn
        delete requestForm.sensors
        delete requestForm.wsn
        setDeviceType(value)
    }

    const renderFormItem = () => {
        if (current === 0) {
            return <BaseInfoForm form={form}/>
        } else if (current === 1) {
            return <DeviceTypeForm form={form} type={deviceType} onChange={onChange}/>
        }
    }

    const onNext = () => {
        form.validateFields().then(values => {
            setRequestForm(Object.assign({}, requestForm, {name: values.name, mac_address: values.mac, asset_id: values.asset}))
            setCurrent(current + 1)
        }).catch(_ => {

        })
    }

    const onComplete = () => {
        form.validateFields().then(values => {
            requestForm.type_id = values.typeId
            requestForm.parent_id = values.parent | 0
            switch (requestForm.type_id) {
                case DeviceType.Gateway:
                    requestForm.ipn = {}
                    requestForm.wsn = {}
                    buildForm(requestForm.ipn, values, IPNSettingKeys)
                    buildForm(requestForm.wsn, values, WSNSettingKeys)
                    break
                default:
                    requestForm.sensors = {}
                    buildForm(requestForm.sensors, values, SensorSettingKeys)
                    if (requestForm.type_id === DeviceType.HighTemperatureCorrosion) {
                        buildForm(requestForm.sensors, values, SpeedObjectSettings.concat(LengthRodSettings))
                    }
                    if (requestForm.type_id === DeviceType.NormalTemperatureCorrosion) {
                        buildForm(requestForm.sensors, values, SpeedObjectSettings)
                    }
                    if (requestForm.type_id === DeviceType.BoltElongation) {
                        buildForm(requestForm.sensors, values, SpeedObjectSettings.concat(PretighteningSettings))
                    }
                    break
            }
            AddDeviceRequest(requestForm).then(_ => setSuccess(true))
        })
    }

    const buildForm = (form:{}, values:any, allowed:string[]) => {
        Object.keys(values)
            .filter(key => allowed.includes(key))
            .forEach(key => {
                Object.assign(form, {[key]: values[key]})
            })
    }

    return <>
        <Content>
            <MyBreadcrumb/>
            <ShadowCard>
                {
                    success && (<Result
                        status="success"
                        title="设备创建成功!"
                        subTitle="您可以返回设备列表查看设备信息或者继续创建设备"
                        extra={[
                            <Button type="primary" key="devices" onClick={() => {
                                window.location.hash = "device-management/devices"
                            }}>
                                返回设备列表
                            </Button>,
                            <Button key="add" onClick={() => {
                                form.resetFields()
                                setCurrent(0)
                                setDeviceType(undefined)
                                setSuccess(false)
                            }}>继续创建设备</Button>,
                        ]}
                    />)
                }
                <Row justify="space-between" hidden={success}>
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
                        <Row>
                            <Col span={20}>
                                {renderFormItem()}
                            </Col>
                            <Col span={20} style={{textAlign: "right"}}>
                                <br/>
                                <br/>
                                <Space>
                                    {
                                        current < steps.length - 1 && (
                                            <Button type="primary" onClick={onNext}>下一步</Button>)
                                    }
                                    {
                                        current > 0 && (<Button onClick={() => setCurrent(current - 1)}>上一步</Button>)
                                    }
                                    {
                                        current === steps.length - 1 && (
                                            <Button type="primary" onClick={onComplete}>完成</Button>)
                                    }
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </ShadowCard>
        </Content>
    </>
}

export default AddDevicePage