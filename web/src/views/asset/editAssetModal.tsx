import {Button, Form, Input, message, Modal, ModalProps, Space, Typography, Upload} from "antd";
import AssetSelect from "../../components/assetSelect";
import LocationSelect from "../../components/locationSelect";
import {FC, useEffect, useState} from "react";
import {Asset} from "../../types/asset";
import {GetAssetRequest, UpdateAssetRequest} from "../../apis/asset";
import {UploadOutlined} from "@ant-design/icons";

export interface AssetEditModalProps extends ModalProps {
    asset: Asset;
    onSuccess: () => void;
}

const EditAssetModal:FC<AssetEditModalProps> = (props) => {
    const [form] = Form.useForm();
    const {visible, asset, onSuccess} = props;
    const [location, setLocation] = useState<any>();
    const [file, setFile] = useState<any>()
    const [parent, setParent] = useState<Asset>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: asset.name,
                parent_id: asset.parentId ? asset.parentId : undefined,
                location: asset.display?.location,
            });
            setLocation(asset.display?.location);
            setParent(asset.parent);
        }
    }, [visible]);

    const onBeforeUpload = (file: any) => {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (isLt2M) {
            setFile(file)
        }else {
            message.error("上传图片大小不能超过2M");
        }
        return false
    }

    const onSave = () => {
        const formData = new FormData()
        if (file) {
            formData.append('file', file)
        }
        form.validateFields(["name"]).then(values => {
            const location = form.getFieldValue('location')
            if (location) {
                formData.append('location', JSON.stringify(location))
            }
            if (parent) {
                formData.append('parent_id', `${parent.id}`)
            }
            formData.append('name', values.name)
            UpdateAssetRequest(asset.id, formData).then(_ => {
                setIsLoading(false)
                onSuccess()
            }).catch(_ => {
                setIsLoading(false)
            })
        }).catch(_ => {
            setIsLoading(false)
        })
    }

    return <Modal title={"资产编辑"} width={420} onOk={onSave} {...props} okText={"更新"} cancelText={"取消"} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item name="name" label={"资产名称"} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
            <Form.Item label={"资产图片"} name={"file"}>
                <Upload name="file"
                        defaultFileList={[
                            {
                                uid: '-1',
                                name: asset.image,
                                status: 'done',
                                url: `/api/resources/assets/${asset.image}`,
                            }
                        ]}
                        maxCount={1}
                        listType="picture"
                        className="upload-list-inline"
                        beforeUpload={onBeforeUpload}
                        showUploadList={true}>
                    <Space>
                        <Button icon={<UploadOutlined />}>上传</Button>
                        <Typography.Text type="secondary">
                            图片大小不超过2M
                        </Typography.Text>
                    </Space>
                </Upload>
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

export default EditAssetModal;