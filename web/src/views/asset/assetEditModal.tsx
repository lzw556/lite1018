import {Form, Input, Modal, ModalProps} from "antd";
import AssetSelect from "../../components/assetSelect";
import LocationSelect from "../../components/locationSelect";
import {FC, useEffect, useState} from "react";
import {Asset} from "../../types/asset";
import {GetAssetRequest, UpdateAssetRequest} from "../../apis/asset";

export interface AssetEditModalProps extends ModalProps {
    asset: Asset;
    onSuccess: () => void;
}

const AssetEditModal:FC<AssetEditModalProps> = (props) => {
    const [form] = Form.useForm();
    const {visible, asset, onSuccess} = props;
    const [location, setLocation] = useState<any>();
    const [parent, setParent] = useState<Asset>();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: asset.name,
                parent_id: asset.parentId,
                location: asset.display?.location,
            });
            setLocation(asset.display?.location);
            setParent(asset.parent);
        }
    }, [visible]);

    const onSave = () => {
        form.validateFields().then(values => {
            UpdateAssetRequest(asset.id, values).then(_ => onSuccess());
        })
    }

    return <Modal title={"资产编辑"} width={420} onOk={onSave} {...props}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item name="name" label={"资产名称"} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
            <Form.Item name={"parent_id"} label={"父节点资产"}>
                <AssetSelect placeholder={"请选择父节点资产"} onChange={value => {
                    GetAssetRequest(value).then(setParent);
                }}/>
            </Form.Item>
            {
                parent && parent.image && <Form.Item label={"资产位置"} name={"location"}>
                    <LocationSelect width={400} height={250}
                                    background={parent.image}
                                    title={"资产位置选择"}
                                    placeholder={"请选择资产位置"}
                                    defaultValue={location}
                                    description={"请在下面图片中标注出资产的位置"}
                                    onChange={value => {
                                        setLocation(value)
                                    }}/>
                </Form.Item>
            }
        </Form>
    </Modal>
}

export default AssetEditModal;