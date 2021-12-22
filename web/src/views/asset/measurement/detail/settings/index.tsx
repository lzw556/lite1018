import {Measurement} from "../../../../../types/measurement";
import {FC, useEffect} from "react";
import {Button, Form} from "antd";
import {UpdateMeasurementSettingRequest} from "../../../../../apis/measurement";

export interface MeasurementSettingsProps {
    measurement: Measurement;
}

const MeasurementSettings:FC<MeasurementSettingsProps> = ({measurement}) => {
    const [form] = Form.useForm();

    useEffect(() => {

    }, [])

    const onSave = () => {
        form.validateFields().then(values => {
            UpdateMeasurementSettingRequest(measurement.id, values).then()
        })
    }

    const renderSettingFormItems = () => {
        if (measurement.sensorSettings) {

        }
        return <div/>
    }

    return <Form form={form}>
        {
            renderSettingFormItems()
        }
        <Button type={"primary"} onClick={onSave}>保存</Button>
    </Form>;
}

export default MeasurementSettings