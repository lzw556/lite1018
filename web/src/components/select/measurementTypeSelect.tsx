import {Select, SelectProps} from "antd";
import {FC} from "react";
import {MeasurementType} from "../../types/measurement_type";
import {CaretDownOutlined} from "@ant-design/icons";

export interface MeasurementTypeSelectProps extends SelectProps<any>{
}

const MeasurementTypeSelect: FC<MeasurementTypeSelectProps> = (props) => {
    return <Select {...props} suffixIcon={<CaretDownOutlined />}>
        <Select.Option value={MeasurementType.BoltLoosening}>{MeasurementType.toString(MeasurementType.BoltLoosening)}</Select.Option>
        <Select.Option value={MeasurementType.BoltElongation}>{MeasurementType.toString(MeasurementType.BoltElongation)}</Select.Option>
        <Select.Option value={MeasurementType.CorrosionThickness}>{MeasurementType.toString(MeasurementType.CorrosionThickness)}</Select.Option>
        <Select.Option value={MeasurementType.Pressure}>{MeasurementType.toString(MeasurementType.Pressure)}</Select.Option>
        <Select.Option value={MeasurementType.FlangeLoosening}>{MeasurementType.toString(MeasurementType.FlangeLoosening)}</Select.Option>
        <Select.Option value={MeasurementType.FlangeElongation}>{MeasurementType.toString(MeasurementType.FlangeElongation)}</Select.Option>
        <Select.Option value={MeasurementType.Vibration}>{MeasurementType.toString(MeasurementType.Vibration)}</Select.Option>
        <Select.Option value={MeasurementType.AngleDip}>{MeasurementType.toString(MeasurementType.AngleDip)}</Select.Option>
        <Select.Option value={MeasurementType.TowerDisplacement}>{MeasurementType.toString(MeasurementType.TowerDisplacement)}</Select.Option>
        <Select.Option value={MeasurementType.TowerSettlement}>{MeasurementType.toString(MeasurementType.TowerSettlement)}</Select.Option>
    </Select>
}

export default MeasurementTypeSelect;