import {Form, Input, Radio, Select} from "antd"
import {DeviceSetting, DeviceSettingValueType} from "../../types/device_setting";
import {FC, useState} from "react";

export interface DeviceSettingFormItemProps {
    value: DeviceSetting
}

const {Option} = Select;

const DeviceSettingFormItem: FC<DeviceSettingFormItemProps> = ({value}) => {
    const [setting, setSetting] = useState<DeviceSetting>(value)

    const renderComponents = () => {
        switch (setting.type) {
            case DeviceSettingValueType.bool:
                return <Radio.Group buttonStyle={"solid"} onChange={e => {
                    setSetting({...setting, value: e.target.value})
                }}>
                    <Radio.Button key={"true"} value={true}>启用</Radio.Button>
                    <Radio.Button key={"false"} value={false}>禁用</Radio.Button>
                </Radio.Group>
        }
        if (setting.options) {
            return <Select onChange={value => setSetting({...setting, value: value})}>
                {
                    Object.keys(setting.options).map(key => {
                        return <Option key={key} value={Number(key)}>{setting.options[key]}</Option>
                    })
                }
            </Select>
        }
        return <Input suffix={setting.unit}/>
    }

    const renderChildren = () => {
        return setting.children && setting.children.map(child => {
            if (setting.value === child.show) {
                return <DeviceSettingFormItem value={child}/>
            }
            return
        })
    }

    return <>
        <Form.Item label={setting.name} name={[setting.category, setting.key]} initialValue={setting.value}>
            {
                renderComponents()
            }
        </Form.Item>
        {
            renderChildren()
        }
    </>
}
export default DeviceSettingFormItem;