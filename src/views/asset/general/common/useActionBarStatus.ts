import * as React from 'react';
import { AssetRow } from '../..';
import { MonitoringPointRow } from '../../../monitoring-point';
import { AssetAction } from './actionBar';

export function useActionBarStatus() {
  const [visible, setVisible] = React.useState(false);
  const [action, setAction] = React.useState<{
    type: AssetAction;
    payload?: any;
  }>({ type: AssetAction.GENERAL_CREATE });

  const handleGeneralCreate = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.GENERAL_CREATE,
      payload: { parentId: paras }
    });
  };

  const handleGeneralUpdate = (asset: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.GENERAL_UPDATE, payload: { asset } });
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
    onGeneralCreate: handleGeneralCreate,
    onGeneralUpdate: handleGeneralUpdate,
    onMonitoringPointCreate: handleMonitoringPointCreate,
    onMonitoringPointUpdate: handleMonitoringPointUpdate
  };
}
