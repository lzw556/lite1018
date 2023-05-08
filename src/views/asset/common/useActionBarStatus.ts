import * as React from 'react';
import { MonitoringPointRow } from '../../monitoring-point';
import { AssetRow } from '../types';
import { AssetAction } from './actionBar';

export function useActionBarStatus() {
  const [open, setVisible] = React.useState(false);
  const [action, setAction] = React.useState<{
    type: AssetAction;
    payload?: any;
  }>({ type: AssetAction.ASSET_CREATE });

  const handleAssetCreate = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.ASSET_CREATE,
      payload: { parentId: paras }
    });
  };

  const handleAssetUpdate = (asset: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.ASSET_UPDATE, payload: { asset } });
  };

  const handleFlangeCreate = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.FLANGE_CREATE,
      payload: { parentId: paras }
    });
  };

  const handleFlangeUpdate = (flange: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.FLANGE_UPDATE, payload: { flange } });
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

  const handleAreaAssetCreate = (paras?: number) => {
    setVisible(true);
    setAction({ type: AssetAction.AREA_ASSET_CREATE, payload: { parentId: paras } });
  };

  const handleAreaAssetUpdate = (asset: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.AREA_ASSET_UPDATE, payload: { asset } });
  };

  const handleCreateTower = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.TOWER_CREATE,
      payload: { parentId: paras }
    });
  };

  const handleUpdateTower = (tower: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.TOWER_UPDATE, payload: { tower } });
  };

  return {
    open,
    setVisible,
    action,
    onAssetCreate: handleAssetCreate,
    onAssetUpdate: handleAssetUpdate,
    onFlangeCreate: handleFlangeCreate,
    onFlangeUpdate: handleFlangeUpdate,
    onMonitoringPointCreate: handleMonitoringPointCreate,
    onMonitoringPointUpdate: handleMonitoringPointUpdate,
    onAreaAssetCreate: handleAreaAssetCreate,
    onAreaAssetUpdate: handleAreaAssetUpdate,
    onTowerCreate: handleCreateTower,
    onTowerUpdate: handleUpdateTower
  };
}
