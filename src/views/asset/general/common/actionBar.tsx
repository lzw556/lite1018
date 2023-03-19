import { Space } from 'antd';
import * as React from 'react';
import {
  GeneralMonitoringPointCreate,
  GeneralMonitoringPointUpdate
} from '../../../monitoring-point';
import { GeneralCreate } from '../manage/create';
import { GeneralUpdate } from '../manage/update';

export enum AssetAction {
  GENERAL_CREATE,
  GENERAL_UPDATE,
  MONITORING_POINT_CREATE,
  MONITORING_POINT_UPDATE
}

export const ActionBar: React.FC<{
  hasPermission: boolean;
  actions: React.ReactNode[];
  visible?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  action: { type: AssetAction; payload?: any };
  onSuccess?: () => void;
  style?: React.CSSProperties;
}> = (props) => {
  const {
    hasPermission,
    actions,
    visible,
    setVisible,
    action: { type, payload },
    onSuccess
  } = props;

  return (
    <Space wrap={true} style={props.style}>
      {hasPermission && actions}
      {visible && type === AssetAction.GENERAL_CREATE && (
        <GeneralCreate
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && type === AssetAction.GENERAL_UPDATE && (
        <GeneralUpdate
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && type === AssetAction.MONITORING_POINT_CREATE && (
        <GeneralMonitoringPointCreate
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && type === AssetAction.MONITORING_POINT_UPDATE && (
        <GeneralMonitoringPointUpdate
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
    </Space>
  );
};
