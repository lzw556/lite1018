import {Select, SelectProps} from "antd";
import {FC} from "react";

export interface MeasurementTypeSelectProps extends SelectProps<any>{
}

export enum MeasurementType {
    BoltLoosening = 1,
    BoltElongation,
    CorrosionThickness,
    Pressure,
    FlangeLoosening,
    FlangeElongation,
    Vibration,
    AngleDip,
    TowerDisplacement,
    TowerSettlement
}

const MeasurementTypeSelect: FC<MeasurementTypeSelectProps> = (props) => {
    return <Select {...props}>
        <Select.Option value={MeasurementType.BoltLoosening}>螺栓松动</Select.Option>
        <Select.Option value={MeasurementType.BoltElongation}>螺栓预紧力</Select.Option>
        <Select.Option value={MeasurementType.CorrosionThickness}>腐蚀厚度</Select.Option>
        <Select.Option value={MeasurementType.Pressure}>压力温度</Select.Option>
        <Select.Option value={MeasurementType.FlangeLoosening}>法兰螺栓松动</Select.Option>
        <Select.Option value={MeasurementType.FlangeElongation}>法兰螺栓预紧力</Select.Option>
        <Select.Option value={MeasurementType.Vibration}>振动</Select.Option>
        <Select.Option value={MeasurementType.AngleDip}>倾斜</Select.Option>
        <Select.Option value={MeasurementType.TowerDisplacement}>塔筒位移</Select.Option>
        <Select.Option value={MeasurementType.TowerSettlement}>塔筒沉降</Select.Option>
    </Select>
}

export default MeasurementTypeSelect;