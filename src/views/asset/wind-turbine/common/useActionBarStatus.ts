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

  const handleFlangeCreate = (paras: AssetRow[] | number) => {
    setVisible(true);
    setAction({
      type: AssetAction.FLANGE_CREATE,
      payload: typeof paras === 'number' ? { windTurbineId: paras } : { windTurbines: paras }
    });
  };

  const handleFlangeUpdate = (flange: AssetRow, windTurbines: AssetRow[]) => {
    setVisible(true);
    setAction({ type: AssetAction.FLANGE_UPDATE, payload: { flange, windTurbines } });
  };

  const handleMonitoringPointCreate = (paras: AssetRow[] | AssetRow) => {
    setVisible(true);
    setAction({
      type: AssetAction.MONITORING_POINT_CREATE,
      payload: Array.isArray(paras) ? { flanges: paras } : { flange: paras }
    });
  };

  const handleMonitoringPointUpdate = (
    monitoringPoint: MonitoringPointRow,
    flanges: AssetRow[]
  ) => {
    setVisible(true);
    setAction({ type: AssetAction.MONITORING_POINT_UPDATE, payload: { monitoringPoint, flanges } });
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
