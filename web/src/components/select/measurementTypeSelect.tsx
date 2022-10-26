import { Select, SelectProps } from 'antd';
import { FC } from 'react';
import { MeasurementType } from '../../types/measurement_type';
import { CaretDownOutlined } from '@ant-design/icons';

export interface MeasurementTypeSelectProps extends SelectProps<any> {}

const MeasurementTypeSelect: FC<MeasurementTypeSelectProps> = (props) => {
  return (
    <Select {...props} suffixIcon={<CaretDownOutlined />}>
      <Select.Option value={MeasurementType.BoltLoosening}>
        {MeasurementType.toString(MeasurementType.BoltLoosening)}
      </Select.Option>
      <Select.Option value={MeasurementType.BoltElongation}>
        {MeasurementType.toString(MeasurementType.BoltElongation)}
      </Select.Option>
      <Select.Option value={MeasurementType.NormalTemperatureCorrosion}>
        {MeasurementType.toString(MeasurementType.NormalTemperatureCorrosion)}
      </Select.Option>
      <Select.Option value={MeasurementType.HighTemperatureCorrosion}>
        {MeasurementType.toString(MeasurementType.HighTemperatureCorrosion)}
      </Select.Option>
      <Select.Option value={MeasurementType.PressureTemperature}>
        {MeasurementType.toString(MeasurementType.PressureTemperature)}
      </Select.Option>
      <Select.Option value={MeasurementType.FlangeLoosening}>
        {MeasurementType.toString(MeasurementType.FlangeLoosening)}
      </Select.Option>
      <Select.Option value={MeasurementType.FlangeElongation}>
        {MeasurementType.toString(MeasurementType.FlangeElongation)}
      </Select.Option>
      <Select.Option value={MeasurementType.Vibration}>
        {MeasurementType.toString(MeasurementType.Vibration)}
      </Select.Option>
      <Select.Option value={MeasurementType.AngleDip}>
        {MeasurementType.toString(MeasurementType.AngleDip)}
      </Select.Option>
      <Select.Option value={MeasurementType.TowerDisplacement}>
        {MeasurementType.toString(MeasurementType.TowerDisplacement)}
      </Select.Option>
      <Select.Option value={MeasurementType.TowerSettlement}>
        {MeasurementType.toString(MeasurementType.TowerSettlement)}
      </Select.Option>
    </Select>
  );
};

export default MeasurementTypeSelect;
