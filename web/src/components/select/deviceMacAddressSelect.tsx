import {MeasurementType} from "../../types/measurement_type";
import {Select, SelectProps, Tag} from "antd";
import {FC, useEffect, useState} from "react";
import BindingDeviceModal from "../modal/bindingDeviceModal";

export interface DeviceMacAddressSelectProps extends SelectProps<any>{
    type?: MeasurementType
    settings?: any
    onChange?: (bindings: any) => void
}

const DeviceMacAddressSelect:FC<DeviceMacAddressSelectProps> = (props) => {
    const {settings, type, onChange} = props
    const [visible, setVisible] = useState(false);
    const [bindingDevices, setBindingDevices] = useState<any>([]);

    useEffect(() => {
        if (onChange) {
            onChange(bindingDevices)
        }
    }, [bindingDevices])

    const onRemoveBindingDevice = (value:any) => {
        const newBindingDevices = bindingDevices.filter((item: any) => item.value !== value)
        setBindingDevices(newBindingDevices)
    };

    return <>
        <Select {...props}
                mode={"multiple"}
                placeholder={"请绑定设备MAC地址"}
                maxTagCount={3}
                open={false}
                tagRender={(props) =>
                    <Tag {...props}
                         closable={true}
                         onClose={e => onRemoveBindingDevice(props.label)}>
                        {props.label}
                    </Tag>
                }
                ref={select => {
                    select?.blur()
                }}
                onFocus={() => {
                    setVisible(true)
                }}
                value={bindingDevices.map((item: any) => item.value)}
                onDeselect={value => {
                    onRemoveBindingDevice(value)
                }}/>
        {
            <BindingDeviceModal visible={visible}
                                quantity={type === MeasurementType.FlangeLoosening || type === MeasurementType.FlangeElongation ? settings.number_of_bolts : 1}
                                onCancel={() => {
                                    setVisible(false)
                                }}
                                defaultValues={bindingDevices}
                                onSuccess={value => {
                                    setBindingDevices(value)
                                    setVisible(false)
                                }}/>
        }
    </>
}

export default DeviceMacAddressSelect;