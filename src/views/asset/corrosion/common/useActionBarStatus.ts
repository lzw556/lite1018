import * as React from 'react';
import { AssetRow } from '../..';
import { MonitoringPointRow } from '../../../monitoring-point';
import { AssetAction } from './actionBar';

export function useActionBarStatus() {
  const [visible, setVisible] = React.useState(false);
  const [action, setAction] = React.useState<{
    type: AssetAction;
    payload?: any;
  }>({ type: AssetAction.AREA_CREATE });

  const handleAreaCreate = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.AREA_CREATE,
      payload: { parentId: paras }
    });
  };

  const handleAreaUpdate = (asset: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.AREA_UPDATE, payload: { asset } });
  };

  const handleAreaAssetCreate = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.AREA_ASSET_CREATE,
      payload: { parentId: paras }
    });
  };

  const handleAreaAssetUpdate = (asset: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.AREA_ASSET_UPDATE, payload: { asset } });
  };

  const handleMonitoringPointCreate = (paras?: AssetRow) => {
    setVisible(true);
    setAction({
      type: AssetAction.MONITORING_POINT_CREATE,
      payload: { parent: paras }
    });
  };

  const handleMonitoringPointUpdate = (monitoringPoint: MonitoringPointRow) => {
    setVisible(true);
    setAction({ type: AssetAction.MONITORING_POINT_UPDATE, payload: { monitoringPoint } });
  };

  return {
    visible,
    setVisible,
    action,
    onAreaCreate: handleAreaCreate,
    onAreaUpdate: handleAreaUpdate,
    onAreaAssetCreate: handleAreaAssetCreate,
    onAreaAssetUpdate: handleAreaAssetUpdate,
    onMonitoringPointCreate: handleMonitoringPointCreate,
    onMonitoringPointUpdate: handleMonitoringPointUpdate
  };
}
