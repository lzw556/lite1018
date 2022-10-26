import { Select, SelectProps } from 'antd';
import { MeasurementType } from '../../types/measurement_type';
import { FC } from 'react';

export interface AcquisitionModeSelectProps extends SelectProps<any> {
  type: MeasurementType;
}

const { Option } = Select;

const AcquisitionModeSelect: FC<AcquisitionModeSelectProps> = (props) => {
  const { type } = props;

  const renderOptions = () => {
    switch (type) {
      case MeasurementType.FlangeLoosening:
      case MeasurementType.FlangeElongation:
      case MeasurementType.TowerSettlement:
      case MeasurementType.TowerDisplacement:
        return (
          <Option key={1} value={1}>
            云端轮询
          </Option>
        );
      default:
        return (
          <>
            <Option key={0} value={0}>
              边缘计算
            </Option>
            <Option key={1} value={1}>
              云端轮询
            </Option>
          </>
        );
    }
  };

  return <Select {...props}>{renderOptions()}</Select>;
};

export default AcquisitionModeSelect;
