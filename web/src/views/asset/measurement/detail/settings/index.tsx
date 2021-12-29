import {Measurement} from "../../../../../types/measurement";
import {FC, useEffect} from "react";
import {Button, Col, Form, Row} from "antd";
import {UpdateMeasurementSettingRequest} from "../../../../../apis/measurement";
import {MeasurementType} from "../../../../../types/measurement_type";
import SamplePeriodFormItem from "../../../../../components/formItems/samplePeriodFormItem";
import PreloadFormItem from "../../../../../components/formItems/preloadFormItem";
import WaveDataFormItem from "../../../../../components/formItems/waveDataFormItem";
import {defaultValidateMessages} from "../../../../../constants/validator";

export interface MeasurementSettingsProps {
    measurement: Measurement;
}

const MeasurementSettings:FC<MeasurementSettingsProps> = ({measurement}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            sensors: {...measurement.sensorSettings},
        })
    }, [])

    const onSave = () => {
        form.validateFields().then(values => {
            UpdateMeasurementSettingRequest(measurement.id, values).then()
        })
    }

    const renderSettingFormItems = () => {
        const items = [<SamplePeriodFormItem />]
        if (measurement.sensorSettings) {
            switch (measurement.type) {
                case MeasurementType.BoltElongation:
                    items.push(<PreloadFormItem enabled={measurement.sensorSettings["pretightening_is_enabled"]}/>)
                    break
                case MeasurementType.Vibration:
                    items.push(<WaveDataFormItem defaultValue={measurement.sensorSettings["schedule1_sensor_flags"]}/>)
                    break
            }
        }
        return items
    }

    return <Form form={form} labelCol={{span: 4}} wrapperCol={{span: 6}} validateMessages={defaultValidateMessages}>
        {
            renderSettingFormItems()
        }
        <Row justify={"end"}>
            <Col span={17}>
                <Button type={"primary"} onClick={onSave}>保存</Button>
            </Col>
        </Row>
    </Form>;
}

export default MeasurementSettings