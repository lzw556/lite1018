import {FC, useEffect, useState} from "react";
import {useForm} from "antd/es/form/Form";
import {AddAssetRequest, GetAssetRequest} from "../../apis/asset";
import {Button, Form, Input, message, Modal, ModalProps, Space, Typography, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import AssetSelect from "../../components/assetSelect";
import LocationSelect from "../../components/locationSelect";
import {defaultValidateMessages} from "../../constants/validator";

export interface AddAssetModelProps extends ModalProps {
    onSuccess: () => void
}

const AddAssetModal: FC<AddAssetModelProps> = (props) => {
    const {visible, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [file, setFile] = useState<any>()
    const [parent, setParent] = useState<any>()
    const [location, setLocation] = useState<any>()
    const [form] = useForm()

    useEffect(() => {
        if (visible) {
            form.resetFields()
            setFile(undefined)
        }
    }, [visible])

    const onAdd = () => {
        setIsLoading(true)
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
            AddAssetRequest(formData).then(_ => {
                setIsLoading(false)
                onSuccess()
            }).catch(_ => {
                setIsLoading(false)
            })
        }).catch(_ => {
            setIsLoading(false)
        })
    }

    const onBeforeUpload = (file: any) => {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (isLt2M) {
            setFile(file)
        }else {
            message.error("上传图片大小不能超过2M");
        }
        return false
    }

    const onPreview = async (file: any) => {
        let src = file.url;
        if (!src) {
            src = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        if (imgWindow) {
            imgWindow.document.write(image.outerHTML);
        }
    };

    const onRemove = (file: any) => {
        setFile(undefined)
    }

    const fetchAsset = (id: number) => {
        GetAssetRequest(id).then(setParent)
    }

    return <Modal title={"资产添加"} width={420} onOk={onAdd} {...props} okText={"确定"} cancelText={"取消"}
                  confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 6}} validateMessages={defaultValidateMessages}>
            <Form.Item name="name" label={"资产名称"} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
            <Form.Item label={"资产图片"} name={"file"}>
                <Upload
                    name="file"
                    listType="picture"
                    className="upload-list-inline"
                    maxCount={1}
                    showUploadList={true}
                    beforeUpload={onBeforeUpload}
                    onRemove={onRemove}
                    onPreview={onPreview}
                >
                    <Space>
                        <Button icon={<UploadOutlined/>}>上传</Button>
                        <Typography.Text type="secondary">
                            图片大小不超过2M
                        </Typography.Text>
                    </Space>
                </Upload>
            </Form.Item>
            <Form.Item name={"parent_id"} label={"父节点资产"}>
                <AssetSelect placeholder={"请选择父节点资产"} onChange={value => {
                    fetchAsset(value)
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

export default AddAssetModal