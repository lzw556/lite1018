import * as React from 'react';
import { AssetRow } from '../..';
import { MonitoringPointRow } from '../../../monitoring-point';
import { AssetAction } from './actionBar';

export function useActionBarStatus() {
  const [visible, setVisible] = React.useState(false);
  const [action, setAction] = React.useState<{
    type: AssetAction;
    payload?: any;
  }>({ type: AssetAction.WIND_TURBINE_CREATE });

  const handleWindTurbineCreate = () => {
    setVisible(true);
    setAction({ type: AssetAction.WIND_TURBINE_CREATE });
  };

  const handleWindTurbineUpdate = (asset: AssetRow) => {
    setVisible(true);
    setAction({ type: AssetAction.WIND_TURBINE_UPDATE, payload: { asset } });
  };

  const handleFlangeCreate = (paras?: number) => {
    setVisible(true);
    setAction({
      type: AssetAction.FLANGE_CREATE,
      payload: { windTurbineId: paras }
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
      payload: { flange: paras }
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
    onWindTurbineCreate: handleWindTurbineCreate,
    onWindTurbineUpdate: handleWindTurbineUpdate,
    onFlangeCreate: handleFlangeCreate,
    onFlangeUpdate: handleFlangeUpdate,
    onMonitoringPointCreate: handleMonitoringPointCreate,
    onMonitoringPointUpdate: handleMonitoringPointUpdate
  };
}
