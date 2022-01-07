import {Form, Input, Radio, Select} from "antd";
import {FC, useEffect, useState} from "react";
import SamplePeriodSelect from "../select/samplePeriodSelect";
import {Rules} from "../../constants/validator";

const {Option} = Select;

export interface WaveDataFormItemProps {
    defaultValue?: any
}

const WaveDataFormItem:FC<WaveDataFormItemProps> = ({defaultValue}) => {
    const [isEnabled, setIsEnabled] = useState<boolean>(false);

    useEffect(() => {
        setIsEnabled(defaultValue === 32);
    }, [defaultValue])

    return <>
        <Form.Item label={"原始数据采集"} name={["sensors", "schedule1_sensor_flags"]}>
            <Radio.Group buttonStyle={"solid"} defaultValue={defaultValue} onChange={e => setIsEnabled(e.target.value === 32)}>
                <Radio.Button key={32} value={32}>启用</Radio.Button>
                <Radio.Button key={0} value={0}>禁用</Radio.Button>
            </Radio.Group>
        </Form.Item>
        {
            isEnabled && <>
                <Form.Item label={"原始数据采集周期"} name={["sensors", "schedule1_sample_period"]}>
                    <SamplePeriodSelect placeholder={"请选择原始数据采集周期"}/>
                </Form.Item>
                <Form.Item label={"原始数据采集延时"} name={["sensors", "schedule1_sample_time_offset"]}>
                    <SamplePeriodSelect placeholder={"请选择原始数据采集延时"}/>
                </Form.Item>
                <Form.Item label={"原始数据采样量程"} name={["sensors", "kx122_continuous_range"]}>
                    <Select placeholder={"请选择原始数据采样量程"}>
                        <Option key={0} value={0}>2g</Option>
                        <Option key={1} value={1}>4g</Option>
                        <Option key={2} value={2}>8g</Option>
                    </Select>
                </Form.Item>
                <Form.Item label={"原始数据采样频率"} name={["sensors", "kx122_continuous_odr"]}>
                    <Select placeholder={"请选择原始数据采样频率"}>
                        <Option key={12} value={12}>3.2KHz</Option>
                        <Option key={13} value={13}>6.4KHz</Option>
                        <Option key={14} value={14}>12.8KHz</Option>
                        <Option key={15} value={15}>25.6KHz</Option>
                    </Select>
                </Form.Item>
                <Form.Item label={"原始数据采样时间"} name={["sensors", "kx122_continuous_sample_times"]} rules={[Rules.number]}>
                    <Input type={"number"} placeholder={"请输入原始数据采样时间"} suffix={"秒"}/>
                </Form.Item>
            </>
        }
    </>
}

export default WaveDataFormItem;