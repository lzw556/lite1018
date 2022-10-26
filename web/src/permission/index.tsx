import { FC } from 'react';
import userPermission, { PermissionType } from './permission';

export interface HasPermissionProps {
  value: PermissionType;
  children: any;
}

const HasPermission: FC<HasPermissionProps> = ({ value, children }) => {
  const { hasPermission } = userPermission();

  return <>{hasPermission(value) && children}</>;
};

export default HasPermission;
