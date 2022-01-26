import {Measurement} from "../../../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {Button, Col, Form, Row} from "antd";
import {GetMeasurementSettingsRequest, UpdateMeasurementSettingRequest} from "../../../../../apis/measurement";
import {defaultValidateMessages} from "../../../../../constants/validator";
import DeviceSettingFormItem from "../../../../../components/formItems/deviceSettingFormItem";
import {DeviceSetting} from "../../../../../types/device_setting";

export interface MeasurementSettingsProps {
    measurement: Measurement;
}

const MeasurementSettings:FC<MeasurementSettingsProps> = ({measurement}) => {
    const [form] = Form.useForm();
    const [deviceSettings, setDeviceSettings] = useState<DeviceSetting[]>([]);

    useEffect(() => {
        GetMeasurementSettingsRequest(measurement.id).then(data => {
            setDeviceSettings(data.sensorSettings);
        });
    }, [])

    const onSave = () => {
        form.validateFields().then(values => {
            UpdateMeasurementSettingRequest(measurement.id, values).then()
        })
    }

    return <Form form={form} labelCol={{span: 4}} wrapperCol={{span: 6}} validateMessages={defaultValidateMessages}>
        {
            deviceSettings.map(setting => <DeviceSettingFormItem editable={true} key={setting.key} value={setting}/>)
        }
        <Row justify={"start"}>
            <Col span={10}>
                <Row justify={"end"}>
                    <Col>
                        <Button type={"primary"} onClick={onSave}>保存</Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Form>;
}

export default MeasurementSettings