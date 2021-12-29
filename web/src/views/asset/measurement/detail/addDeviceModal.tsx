import {Form, Modal, ModalProps} from "antd";
import {Measurement} from "../../../../types/measurement";
import {FC, useEffect} from "react";
import {defaultValidateMessages, Rules} from "../../../../constants/validator";
import DeviceMacAddressSelect from "../../../../components/select/deviceMacAddressSelect";
import {UpdateMeasurementDevicesBindingRequest} from "../../../../apis/measurement";
import DeviceTypeSelect from "../../../../components/select/deviceTypeSelect";
import {MeasurementType} from "../../../../types/measurement_type";

export interface AddDeviceModalProps extends ModalProps{
    measurement: Measurement
    onSuccess: () => void
}

const AddDeviceModal:FC<AddDeviceModalProps> = (props) => {
    const {measurement, visible, onSuccess} = props
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            console.log(measurement.settings)
        }
    }, [visible])

    const onSave = () => {
        form.validateFields().then(values => {
            console.log(values)
            UpdateMeasurementDevicesBindingRequest(measurement.id, values).then(_ => {
                onSuccess()
            })
        })
    }

    return <Modal {...props} title={"传感器绑定"} width={360} onOk={onSave}>
        <Form form={form} validateMessages={defaultValidateMessages} labelCol={{span: 6}}>
            <Form.Item label={"设备类型"} name={"device_type"} rules={[Rules.required]}>
                <DeviceTypeSelect sensors={MeasurementType.toDeviceType(measurement.type)}/>
            </Form.Item>
            <Form.Item label={"MAC地址"} name={"binding_devices"} rules={[Rules.required()]}>
                <DeviceMacAddressSelect type={measurement.type} settings={measurement.settings}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default AddDeviceModal;