import {Button, Divider, Form, Select} from "antd"
import {SAMPLE_PERIOD_1} from "../../../../constants";
import {Period} from "../../../../types/period";
import {DeviceType} from "../../../../types/device_type";
import SpeedObjectFormItem from "./speedObjectFormItem";
import {DownOutlined, UpOutlined} from "@ant-design/icons";
import {useState} from "react";
import PretighteningFormItem from "./pretighteningFormItem";
import LengthRodFormItem from "./lengthRodFormItem";

const {Option} = Select

export const SensorSettingKeys = ["schedule0_sample_period"]

const SensorFormItem = (props: any) => {
    const {deviceType, device} = props

    const [expand, setExpand] = useState<boolean>(false)

    const getSamplePeriods = (): Period[] => {
        return SAMPLE_PERIOD_1
    }

    const getDefaultSpeedObject = () => {
        return device ? Number(device.sensors.speed_object) : 6000
    }

    const getDefaultSamplePeriod = () => {
        return device ? device.sensors.schedule0_sample_period : null
    }

    const renderFormItem = () => {
        switch (deviceType) {
            case DeviceType.NormalTemperatureCorrosion:
                return <SpeedObjectFormItem value={getDefaultSpeedObject()}/>
            case DeviceType.HighTemperatureCorrosion:
                return <div>
                    <SpeedObjectFormItem value={getDefaultSpeedObject()}/>
                    <Divider orientation={"left"} plain><Button type="link" size="small" onClick={() => {
                        setExpand(!expand)
                    }
                    }>{expand ? <UpOutlined/> : <DownOutlined/>} 高级配置</Button></Divider>
                    {
                        <LengthRodFormItem expand={expand}/>
                    }
                </div>
            case DeviceType.BoltElongation:
                return <div>
                    <SpeedObjectFormItem value={getDefaultSpeedObject()}/>
                    <PretighteningFormItem enabled={!!device.sensors.pretightening_is_enabled}/>
                </div>
        }
        return null
    }

    return <div>
        <Form.Item label={"采集周期"} name="schedule0_sample_period" initialValue={getDefaultSamplePeriod()} rules={[{required: true, message: "请选择采集周期"}]}>
            <Select placeholder={"请选择采集周期"}>
                {
                    getSamplePeriods().map(item =>
                        <Option key={item.value} value={item.value}>{item.text}</Option>
                    )
                }
            </Select>
        </Form.Item>
        {
            renderFormItem()
        }
    </div>
}

export default SensorFormItem