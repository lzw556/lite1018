import {Device} from "../../../../types/device";
import {FC, useEffect, useState} from "react";
import {GetDeviceSettingRequest, UpdateDeviceSettingRequest} from "../../../../apis/device";
import "../../index.css"
import {Button, Col, Form, Row, Skeleton} from "antd";
import {EmptyLayout} from "../../../layout";
import {DeviceSetting} from "../../../../types/device_setting";
import DeviceSettingFormItem from "../../../../components/formItems/deviceSettingFormItem";
import {defaultValidateMessages} from "../../../../constants/validator";

export interface SettingPageProps {
    device?: Device
}

const SettingPage: FC<SettingPageProps> = ({device}) => {
    const [settings, setSettings] = useState<DeviceSetting[]>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm();

    useEffect(() => {
        if (device) {
            setIsLoading(true)
            GetDeviceSettingRequest(device.id).then(data => {
                setIsLoading(false)
                setSettings(data)
            })
        }
    }, [device])

    const renderSetting = () => {
        if (device) {
            if (settings) {
                return settings.map(setting => (
                    <DeviceSettingFormItem editable={true} value={setting} key={setting.key}/>))
            }
            return <EmptyLayout description={"暂无配置信息"}/>
        }
        return <div>

        </div>
    }

    const onSave = () => {
        if (device) {
            form.validateFields().then(values => {
                UpdateDeviceSettingRequest(device.id, values).then()
            })
        }
    }

    return <Skeleton loading={isLoading}>
        <Row justify={"start"}>
            <Col xxl={8} xl={10}>
                <Form form={form} labelCol={{xl: 7, xxl: 6}} validateMessages={defaultValidateMessages}>
                    {
                        renderSetting()
                    }
                </Form>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col xl={10} xxl={8}>
                <Row justify={"end"}>
                    <Col>
                        <Button type={"primary"} onClick={onSave}>保存</Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Skeleton>
}

export default SettingPage