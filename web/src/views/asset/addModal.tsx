import {useEffect, useState} from "react";
import {useForm} from "antd/es/form/Form";
import {AddAssetRequest, GetAssetRequest} from "../../apis/asset";
import {Form, Input, Modal, Upload} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import AssetSelect from "../../components/assetSelect";
import {Asset} from "../../types/asset";
import LocationSelect from "../../components/locationSelect";

export interface AddAssetProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const AddModal = (props: AddAssetProps) => {
    const {visible, onCancel, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [imageUrl, setImageUrl] = useState<any>('')
    const [parent, setParent] = useState<Asset>()
    const [file, setFile] = useState<any>()
    const [location, setLocation] = useState<any>()
    const [form] = useForm()

    useEffect(() => {
        if (visible) {
            form.resetFields()
            setFile(undefined)
            setImageUrl(undefined)
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
        setFile(file)
        getBase64(file).then(imageUrl => {
            setImageUrl(imageUrl)
        })
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
        setImageUrl(undefined)
    }

    const getBase64 = (file: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    const fetchAsset = (id:number) => {
        GetAssetRequest(id).then(setParent)
    }

    return <Modal title={"资产添加"} width={420} onOk={onAdd} {...props}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item name="name" label={"资产名称"} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
            <Form.Item label={"资产图片"} name={"file"}>
                <Upload
                    name="file"
                    listType="picture-card"
                    className="avatar-uploader"
                    beforeUpload={onBeforeUpload}
                    onRemove={onRemove}
                    onPreview={onPreview}
                >
                    {
                        !file && <div>
                            <PlusOutlined/>
                            <div style={{marginTop: 8}}>Upload</div>
                        </div>
                    }
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

export default AddModal