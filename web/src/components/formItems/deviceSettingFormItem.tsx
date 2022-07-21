import {Form, Input, InputNumber, Radio, Select} from "antd"
import {DeviceSetting, DeviceSettingValueType} from "../../types/device_setting";
import {FC, useState} from "react";
import {Normalizes, Rules} from "../../constants/validator";

export interface DeviceSettingFormItemProps {
    value: DeviceSetting
    editable: boolean
}

const {Option} = Select;

const DeviceSettingFormItem: FC<DeviceSettingFormItemProps> = ({value, editable}) => {
    const [setting, setSetting] = useState<DeviceSetting>(value)

    const renderComponents = () => {
        switch (setting.type) {
            case DeviceSettingValueType.bool:
                return <Radio.Group disabled={!editable} buttonStyle={"solid"} onChange={e => {
                    setSetting({...setting, value: e.target.value})
                }}>
                    <Radio.Button key={"true"} value={true}>启用</Radio.Button>
                    <Radio.Button key={"false"} value={false}>禁用</Radio.Button>
                </Radio.Group>
        }
        if (setting.options) {
            return <Select onChange={value => setSetting({...setting, value: value})} disabled={!editable}>
                {
                    Object.keys(setting.options).map(key => {
                        return <Option key={key} value={Number(key)}>{setting.options[key]}</Option>
                    })
                }
            </Select>
        }
        let inputType: string;

        return <Input type={"number"} suffix={setting.unit} disabled={!editable}/>
    }

    const renderChildren = () => {
        return setting.children && setting.children.map(child => {
            if (setting.value === child.show) {
                return <DeviceSettingFormItem editable={editable} value={child}/>
            }
            return
        })
    }

    const renderRules = (setting:DeviceSetting) => {
        switch (setting.type) {
            case DeviceSettingValueType.uint8:
            case DeviceSettingValueType.uint16:
            case DeviceSettingValueType.uint32:
            case DeviceSettingValueType.uint64:
            case DeviceSettingValueType.float:
                if (setting.validator) {
                    return [{...Rules.number(), ...setting.validator}]
                }
               return [Rules.number()]
            default:
                if (setting.validator) {
                    return [setting.validator]
                }
                return []
        }
    }

    return <>
        <Form.Item label={setting.name} name={[setting.category, setting.key]}  initialValue={setting.value} rules={renderRules(setting)}>
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