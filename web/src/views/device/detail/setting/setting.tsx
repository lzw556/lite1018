import {FC, useState} from "react";
import {Button, Form, FormItemProps, message, Space} from "antd";
import {CheckOutlined, CloseOutlined, EditOutlined} from "@ant-design/icons";
import {UpdateDeviceSettingRequest} from "../../../../apis/device";
import {Device} from "../../../../types/device";
import {ColorHealth} from "../../../../constants/color";

export interface SettingProps extends FormItemProps{
    device: Device
    name: string
    value?: any
    editable?: (value: any) => any
    displayRender?: (value: any) => any
    onSuccess: (setting: any) => void
}

const Setting: FC<SettingProps> = (props) => {
    const {
        device,
        name,
        value,
        displayRender,
        editable,
        onSuccess
    } = props
    const [editSetting, setEditSetting] = useState<boolean>(false)
    const [setting] = useState<any>({[name]: value})

    const onSave = (setting: any) => {
        console.log(setting)
        UpdateDeviceSettingRequest(device.id, setting).then(res => {
            if (res.code === 200) {
                message.success("保存成功").then()
                setEditSetting(false)
                onSuccess(setting)
            } else {
                message.error("保存失败").then()
            }
        })
    }

    const renderSetting = () => {
        if (setting && editable) {
            if (editSetting) {
                return <Space>
                    {
                        editable(setting)
                    }
                    <Button type={"text"} size={"small"} style={{color: ColorHealth}} onClick={() => {
                        onSave(setting)
                    }} icon={<CheckOutlined/>}/>
                    <Button type={"text"} size={"small"} onClick={() => setEditSetting(false)}
                            icon={<CloseOutlined/>}
                            danger/>
                </Space>
            } else {
                return <Space>
                    {
                        displayRender ? displayRender(setting[name]) : setting[name]
                    }
                    <a onClick={() => setEditSetting(true)}><EditOutlined/></a>
                </Space>
            }
        } else {
            return <Space>
                -
            </Space>
        }
    }

    return <>
        <Form.Item labelAlign={"left"} colon={false} labelCol={{span: 8}} {...props}>
            {
                renderSetting()
            }
        </Form.Item>
    </>
}
export default Setting