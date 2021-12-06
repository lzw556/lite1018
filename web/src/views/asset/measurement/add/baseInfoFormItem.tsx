import {Divider, Form, Input} from "antd";
import {Rules} from "../../../../constants/validator";
import MeasurementTypeSelect, {MeasurementType} from "../../../../components/measurementTypeSelect";
import AssetSelect from "../../../../components/assetSelect";
import {FC, useState} from "react";
import {GetMeasurementParametersRequest} from "../../../../apis/measurement";
import {CaretDownOutlined} from "@ant-design/icons";

const BaseInfoFormItem: FC = () => {
    const [type, setType] = useState<MeasurementType>();
    const [parameters, setParameters] = useState<any>();

    const fetchMeasurementParameters = (id: number) => {
        GetMeasurementParametersRequest(id).then(setParameters)
    }

    const renderParameterItems = () => {
        if (!parameters) return null;
        return <>
            <Divider orientation={'left'} plain>参数配置</Divider>
            {
                parameters.map((item: any) => (
                    <Form.Item key={item.name} name={item.name} label={item.label} rules={[Rules.required]}>
                        <Input placeholder={`请输入${item.label}`}/>
                    </Form.Item>
                ))
            }
        </>
    };

    return <>
        <Divider orientation="left" plain>基本信息</Divider>
        <Form.Item label={"监测点名称"} name={"name"} rules={[Rules.required]}>
            <Input placeholder={"请输入监测点名称"}/>
        </Form.Item>
        <Form.Item label={"监测点类型"} name={"type"} rules={[Rules.required]}>
            <MeasurementTypeSelect suffixIcon={<CaretDownOutlined/>} placeholder={"请选择监测点类型"} onChange={value => {
                setType(value);
                fetchMeasurementParameters(value);
            }}/>
        </Form.Item>
        <Form.Item label={"所属资产"} name={"asset"} rules={[Rules.required]}>
            <AssetSelect placeholder={"请选择所属资产"}/>
        </Form.Item>
        {
            renderParameterItems()
        }
    </>
}

export default BaseInfoFormItem