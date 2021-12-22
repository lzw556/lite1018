import {Col, Divider, Form, Input, Row} from "antd";
import {Rules} from "../../../../constants/validator";
import MeasurementTypeSelect from "../../../../components/select/measurementTypeSelect";
import {FC, useEffect, useState} from "react";
import {CaretDownOutlined} from "@ant-design/icons";
import FlangeFormItem from "../../../../components/formItems/flangeFormItem";
import {GetAssetRequest} from "../../../../apis/asset";
import {Asset} from "../../../../types/asset";
import LocationSelect from "../../../../components/locationSelect";
import {MeasurementType} from "../../../../types/measurement_type";
import AssetTreeSelect from "../../../../components/select/assetTreeSelect";

export interface BaseInfoFormItemProps {
    form: any
    type?: MeasurementType;
    onTypeChange?: (type: MeasurementType) => void;
}

const BaseInfoFormItem: FC<BaseInfoFormItemProps> = ({form, type, onTypeChange}) => {
    const [asset, setAsset] = useState<Asset>()
    const [location, setLocation] = useState<any>()

    useEffect(() => {
        const assetId = form.getFieldValue('asset')
        if (assetId) {
            fetchAsset(assetId)
        }
        const point = form.getFieldValue('location')
        if (point) {
            setLocation([point.x, point.y])
        }
    }, [])

    const renderMeasurementSettingItems = () => {
        switch (type) {
            case MeasurementType.FlangeElongation:
            case MeasurementType.FlangeLoosening:
                return <>
                    <Divider orientation={'left'} plain>参数配置</Divider>
                    <FlangeFormItem/>
                </>
        }
        return <></>
    };

    const fetchAsset = (id: number) => {
        GetAssetRequest(id).then(setAsset)
    }

    return <Row justify={"start"}>
        <Col span={24}>
            <Divider orientation="left" plain>基本信息</Divider>
            <Form.Item label={"监测点名称"} name={"name"} rules={[Rules.required]}>
                <Input placeholder={"请输入监测点名称"}/>
            </Form.Item>
            <Form.Item label={"监测点类型"} name={"type"} rules={[Rules.required]} initialValue={type}>
                <MeasurementTypeSelect suffixIcon={<CaretDownOutlined/>} placeholder={"请选择监测点类型"} onChange={value => {
                    onTypeChange && onTypeChange(value as MeasurementType)
                }}/>
            </Form.Item>
            <Form.Item label={"所属资产"} name={"asset"} rules={[Rules.required]}>
                <AssetTreeSelect placeholder={"请选择所属资产"} onChange={fetchAsset}/>
            </Form.Item>
            {
                asset && asset.image && <Form.Item label={"监测点位置"} name={"location"}>
                    <LocationSelect
                        width={400}
                        height={250}
                        background={asset.image}
                        title={"监测点位置"}
                        defaultValue={location}
                        placeholder={"请选择监测点位置"}
                        description={"请在下面图片中标注出监测点的位置"}
                        onChange={point => {
                            setLocation(point)
                        }}/>
                </Form.Item>
            }
            {
                renderMeasurementSettingItems()
            }
        </Col>
    </Row>
}

export default BaseInfoFormItem