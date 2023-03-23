import { Space } from 'antd';
import * as React from 'react';
import { HydroFlangeCreate, HydroFlangeUpdate } from '../../../flange';
import {
  HydroTurbineMonitoringPointCreate,
  HydroTurbineMonitoringPointUpdate
} from '../../../monitoring-point';
import { HydroTurbineCreate } from '../manage/create';
import { HydroTurbineUpdate } from '../manage/update';

export enum AssetAction {
  HYDRO_TURBINE_CREATE,
  HYDRO_TURBINE_UPDATE,
  FLANGE_CREATE,
  FLANGE_UPDATE,
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
      {visible && type === AssetAction.HYDRO_TURBINE_CREATE && (
        <HydroTurbineCreate
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && type === AssetAction.HYDRO_TURBINE_UPDATE && (
        <HydroTurbineUpdate
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
      {visible && type === AssetAction.FLANGE_CREATE && (
        <HydroFlangeCreate
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
      {visible && type === AssetAction.FLANGE_UPDATE && (
        <HydroFlangeUpdate
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
        <HydroTurbineMonitoringPointCreate
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
        <HydroTurbineMonitoringPointUpdate
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
