import { Select, SelectProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import { GetNetworksRequest } from '../../apis/network';
import { Network } from '../../types/network';

export interface NetworkSelectProps extends SelectProps<any> {}

const { Option } = Select;

const NetworkSelect: FC<NetworkSelectProps> = (props) => {
  const [dataSource, setDataSource] = useState<Network[]>([]);

  useEffect(() => {
    console.log('123');
    GetNetworksRequest().then(setDataSource);
  }, []);

  return (
    <Select {...props} placeholder={'请选择网络'}>
      {dataSource.map((network) => (
        <Option key={network.id} value={network.id}>
          {network.name}
        </Option>
      ))}
    </Select>
  );
};

export default NetworkSelect;
