import {Form, Input, Modal, ModalProps} from "antd";
import {Measurement} from "../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {Rules} from "../../../constants/validator";
import AssetTreeSelect from "../../../components/select/assetTreeSelect";
import LocationSelect from "../../../components/locationSelect";
import {UpdateMeasurementRequest} from "../../../apis/measurement";
import {GetAssetRequest} from "../../../apis/asset";
import AcquisitionModeSelect from "../../../components/select/acquisitionModeSelect";
import CommunicationPeriodSelect from "../../../components/communicationPeriodSelect";

export interface EditMeasurementModalProps extends ModalProps {
    measurement: Measurement;
    onSuccess: () => void;
}

const EditMeasurementModal:FC<EditMeasurementModalProps> = (props) => {
    const {measurement, visible, onSuccess} = props;
    const [form] = Form.useForm();
    const [location, setLocation] = useState(measurement.display?.location);
    const [mode, setMode] = useState(0)
    const [asset, setAsset] = useState(measurement.asset);

    useEffect(() => {
        if (visible) {
            setMode(measurement.mode)
            form.setFieldsValue({
                name: measurement.name,
                asset: measurement.asset?.id,
                location: location,
                polling_period: measurement.pollingPeriod,
                acquisition_mode: measurement.mode,
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

    return <Modal {...props} title={"监测点编辑"} okText={"更新"} cancelText={"取消"} width={420} onOk={onSave}>
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
            <Form.Item label={"采集方式"} name={"acquisition_mode"} rules={[Rules.required]}>
                <AcquisitionModeSelect type={measurement.type} onChange={setMode}/>
            </Form.Item>
            {
                mode === 1 && <Form.Item label={"轮询周期"} name={"polling_period"} rules={[Rules.required]}>
                    <CommunicationPeriodSelect placeholder={"请选择轮询周期"} />
                </Form.Item>
            }
        </Form>
    </Modal>
}

export default EditMeasurementModal;