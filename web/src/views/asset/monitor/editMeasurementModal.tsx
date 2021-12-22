import {Form, Input, Modal, ModalProps, Select} from "antd";
import {Measurement} from "../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {Rules} from "../../../constants/validator";
import AssetTreeSelect from "../../../components/select/assetTreeSelect";
import LocationSelect from "../../../components/locationSelect";
import {UpdateMeasurementRequest} from "../../../apis/measurement";
import {GetAssetRequest} from "../../../apis/asset";
import {COMMUNICATION_TIME_OFFSET, SAMPLE_PERIOD_1} from "../../../constants";

export interface EditMeasurementModalProps extends ModalProps {
    measurement: Measurement;
    onSuccess: () => void;
}

const {Option} = Select;

const EditMeasurementModal:FC<EditMeasurementModalProps> = (props) => {
    const {measurement, visible, onSuccess} = props;
    const [form] = Form.useForm();
    const [location, setLocation] = useState(measurement.display?.location);
    const [asset, setAsset] = useState(measurement.asset);

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: measurement.name,
                asset: measurement.asset?.id,
                location: location,
                sample_period: measurement.samplePeriod,
                sample_period_time_offset: measurement.samplePeriodTimeOffset,
            })
        }
    }, [visible])

    const onSave = () => {
        form.validateFields().then(values => {
            UpdateMeasurementRequest(measurement.id, values).then(_ => onSuccess())
        })
    }

    const fetchAsset = (id:number) => {
        GetAssetRequest(id).then(setAsset)
        setLocation(undefined)
    }

    return <Modal {...props} title={"监测点编辑"} width={420} onOk={onSave}>
        <Form form={form} labelCol={{span:6}}>
            <Form.Item name={"name"} label={"监测点名称"} rules={[Rules.required]}>
                <Input />
            </Form.Item>
            <Form.Item name={"asset"} label={"所属资产"} rules={[Rules.required]}>
                <AssetTreeSelect onChange={fetchAsset}/>
            </Form.Item>
            <Form.Item name={"location"} label={"监测点位置"}>
                <LocationSelect width={400} height={250}
                                placeholder={"请选择监测点的位置"}
                                defaultValue={location}
                                background={asset ? asset.image : ""}
                                onChange={point => {
                                    setLocation(point);
                                }}/>
            </Form.Item>
            <Form.Item label={"采集周期"} name={"sample_period"} rules={[Rules.required]}>
                <Select placeholder={"请选择采集周期"}>
                    {
                        SAMPLE_PERIOD_1.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))
                    }
                </Select>
            </Form.Item>
            <Form.Item label={"采集延时"} name={"sample_period_time_offset"} rules={[Rules.required]}>
                <Select placeholder={"请选择采集延时"}>
                    {
                        COMMUNICATION_TIME_OFFSET.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))
                    }
                </Select>
            </Form.Item>
        </Form>
    </Modal>
}

export default EditMeasurementModal;