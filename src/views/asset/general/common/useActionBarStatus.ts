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

  const handleGeneralCreate = (paras: AssetRow[] | number) => {
    setVisible(true);
    setAction({
      type: AssetAction.GENERAL_CREATE,
      payload: Array.isArray(paras) ? { parents: paras } : { parentId: paras }
    });
  };

  const handleGeneralUpdate = (asset: AssetRow, parents?: AssetRow[]) => {
    debugger;
    setVisible(true);
    setAction({ type: AssetAction.GENERAL_UPDATE, payload: { asset, parents } });
  };

  const handleMonitoringPointCreate = (paras: AssetRow[] | AssetRow) => {
    setVisible(true);
    setAction({
      type: AssetAction.MONITORING_POINT_CREATE,
      payload: Array.isArray(paras) ? { parents: paras } : { parent: paras }
    });
  };

  const handleMonitoringPointUpdate = (
    monitoringPoint: MonitoringPointRow,
    parents: AssetRow[]
  ) => {
    setVisible(true);
    setAction({ type: AssetAction.MONITORING_POINT_UPDATE, payload: { monitoringPoint, parents } });
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
