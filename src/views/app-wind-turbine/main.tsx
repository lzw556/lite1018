import React from 'react';
import { Spin } from 'antd';
import { AssetRow, ContextProps, MonitoringPointRow } from '../asset-common';
import * as Wind from './detail/index';
import * as Flange from './flange';
import * as Tower from './tower';
import * as Point from './point';
import { wind, flange, tower } from './constants';

export const Main = ({ loading, selectedNode, refresh }: ContextProps) => {
  const [open, setOpen] = React.useState(false);
  const [mointoringPoint, setMonitoringPoint] = React.useState<MonitoringPointRow | undefined>();
  const props = {
    asset: selectedNode as AssetRow,
    onSuccess: refresh,
    onUpdate: (m: MonitoringPointRow) => {
      setOpen(true);
      setMonitoringPoint(m);
    }
  };
  let ele = null;
  if (selectedNode) {
    if (selectedNode.type === wind.type) {
      ele = <Wind.Index {...props} />;
    } else if (selectedNode.type === flange.type) {
      ele = <Flange.Index {...props} />;
    } else if (selectedNode.type === tower.type) {
      ele = <Tower.Index {...props} />;
    } else {
      ele = (
        <Point.Index
          {...{ monitoringPoint: selectedNode as MonitoringPointRow, onSuccess: refresh }}
        />
      );
    }
  }
  return (
    <Spin spinning={loading}>
      {ele}
      {mointoringPoint && (
        <Point.UpdateModal
          key={mointoringPoint.id}
          monitoringPoint={mointoringPoint}
          open={open}
          onCancel={() => {
            setOpen(false);
            setMonitoringPoint(undefined);
          }}
          onSuccess={() => {
            refresh();
            setOpen(false);
            setMonitoringPoint(undefined);
          }}
        />
      )}
    </Spin>
  );
};
