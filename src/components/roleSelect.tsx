import { FC, useEffect, useState } from 'react';
import { PagingRolesRequest } from '../apis/role';
import { Role } from '../types/role';
import { CaretDownOutlined } from '@ant-design/icons';
import { Select, SelectProps } from 'antd';
import intl from 'react-intl-universal';

export interface RoleSelectProps extends SelectProps<any> {}

const { Option } = Select;

const RoleSelect: FC<RoleSelectProps> = (props) => {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    PagingRolesRequest(1, 100).then((data) => {
      setRoles(data.result);
    });
  }, []);

  return (
    <Select {...props} suffixIcon={<CaretDownOutlined />}>
      {roles.map((item) => (
        <Option key={item.id} value={item.id}>
          {intl.get(item.name).d(item.name)}
        </Option>
      ))}
    </Select>
  );
};

export default RoleSelect;
