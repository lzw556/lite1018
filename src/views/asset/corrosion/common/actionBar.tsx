import { Space } from 'antd';
import * as React from 'react';
import { AreaMonitoringPointCreate, AreaMonitoringPointUpdate } from '../../../monitoring-point';
import { AreaCreate } from '../manage/create';
import { AreaAssetCreate } from '../manage/pipe&tank/create';
import { AreaAssetUpdate } from '../manage/pipe&tank/update';
import { AreaUpdate } from '../manage/update';

export enum AssetAction {
  AREA_CREATE,
  AREA_UPDATE,
  AREA_ASSET_CREATE,
  AREA_ASSET_UPDATE,
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
      {visible && type === AssetAction.AREA_CREATE && (
        <AreaCreate
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
      {visible && type === AssetAction.AREA_UPDATE && (
        <AreaUpdate
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
      {visible && type === AssetAction.AREA_ASSET_CREATE && (
        <AreaAssetCreate
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
      {visible && type === AssetAction.AREA_ASSET_UPDATE && (
        <AreaAssetUpdate
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
        <AreaMonitoringPointCreate
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
        <AreaMonitoringPointUpdate
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
