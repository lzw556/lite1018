import {FC, useState} from "react";
import {Form, Input, Modal, ModalProps, Upload} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import AssetSelect from "../../components/assetSelect";
import ImgCrop from "antd-img-crop";

export interface AssetModalProps extends ModalProps {
    form: any
}

const AssetModal: FC<AssetModalProps> = (props) => {
    const {form} = props
    const [imageUrl, setImageUrl] = useState<any>('')

    const onBeforeUpload = (file:any) => {
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

    const getFile=(e:any) => {
        const formData = new FormData()
        console.log(e)
        formData.append('file', e.file)
        console.log(formData)
        if (Array.isArray(e)) {
            return e
        }
        return  e && e.fileList
    }

    const getBase64 = (file: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    return <Modal {...props}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item name="name" label={"资产名称"} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
            <Form.Item label={"资产图片"} name={"file"} getValueFromEvent={getFile}>
                <ImgCrop rotate>
                    <Upload
                        name="file"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        beforeUpload={onBeforeUpload}
                        onPreview={onPreview}
                    >
                        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : <div>
                            <PlusOutlined/>
                            <div style={{marginTop: 8}}>Upload</div>
                        </div>}

                    </Upload>
                </ImgCrop>
            </Form.Item>
            <Form.Item name={"parent"} label={"父节点资产"}>
                <AssetSelect placeholder={"请选择父节点资产"}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default AssetModal