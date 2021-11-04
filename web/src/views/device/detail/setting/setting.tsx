import {FC, useState} from "react";
import {Button, Form, message, Space} from "antd";
import {CheckOutlined, CloseOutlined, EditOutlined} from "@ant-design/icons";
import {UpdateDeviceSettingRequest} from "../../../../apis/device";
import {Device} from "../../../../types/device";
import {ColorHealth} from "../../../../constants/color";

export interface SettingProps {
    device: Device
    name: string
    title: string
    description?: string
    value?: any
    editable: boolean
    renderEdit: (value: any) => any
    renderValue?: (value: any) => any
    onSuccess: (setting: any) => void
}

const Setting: FC<SettingProps> = ({device, name, description, value, title, renderValue, editable, renderEdit, onSuccess}) => {
    const [editSetting, setEditSetting] = useState<boolean>(false)
    const [setting] = useState<any>({[name]: value})

    const onSave = (setting: any) => {
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
                        renderEdit(setting)
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
                        renderValue? renderValue(setting[name]) : setting[name]
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
        <Form.Item labelAlign={"left"}  colon={false} labelCol={{span: 8}} tooltip={description} label={title}>
            {
                renderSetting()
            }
        </Form.Item>
    </>
}
export default Setting