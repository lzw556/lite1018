import { Select, SelectProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import { GetNetworksRequest } from '../../apis/network';
import { Network } from '../../types/network';
import intl from 'react-intl-universal';

export interface NetworkSelectProps extends SelectProps<any> {}

const { Option } = Select;

const NetworkSelect: FC<NetworkSelectProps> = (props) => {
  const [dataSource, setDataSource] = useState<Network[]>([]);

  useEffect(() => {
    console.log('123');
    GetNetworksRequest().then(setDataSource);
  }, []);

  return (
    <Select {...props} placeholder={intl.get('PLEASE_SELECT_NETWORK')}>
      {dataSource.map((network) => (
        <Option key={network.id} value={network.id}>
          {network.name}
        </Option>
      ))}
    </Select>
  );
};

export default NetworkSelect;
