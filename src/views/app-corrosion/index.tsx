import React from 'react';
import { Spin } from 'antd';
import { Asset, AssetRow, ContextProps, MonitoringPointRow } from '../asset-common';
import * as Point from './point';
import * as Detail from './detail';

export const Index = ({ loading, selectedNode, refresh }: ContextProps) => {
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
    if (Asset.Assert.isCorrosionRelated(selectedNode.type)) {
      ele = <Detail.Index {...props} />;
    } else {
      ele = (
        <Point.Index
          {...{ monitoringPoint: selectedNode as MonitoringPointRow, onSuccess: refresh }}
        />
      );
    }
  }

  const reset = () => {
    setOpen(false);
    setMonitoringPoint(undefined);
  };

  return (
    <Spin spinning={loading}>
      {ele}
      {mointoringPoint && (
        <Point.UpdateModal
          key={mointoringPoint.id}
          monitoringPoint={mointoringPoint}
          open={open}
          onCancel={reset}
          onSuccess={() => {
            refresh();
            reset();
          }}
        />
      )}
    </Spin>
  );
};
