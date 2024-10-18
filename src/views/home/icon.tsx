import React from 'react';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { Asset, AssetRow, MonitoringPointRow } from '../asset-common';
import * as Area from '../asset-area';
import * as Variant from '../asset-variant';
import * as Wind from '../app-wind-turbine';
import * as MonitoringPoint from '../asset-common/monitoring-point';

export const Icon = (
  props: Partial<CustomIconComponentProps> & {
    node: AssetRow | MonitoringPointRow | undefined;
  }
) => {
  const { node, ...rest } = props;
  if (node) {
    if (Asset.Assert.isArea(node.type)) {
      return <Area.Icon asset={node as AssetRow} {...rest} />;
    } else if (
      Asset.Assert.isCorrosionRelated(node.type) ||
      Asset.Assert.isVibrationRelated(node.type)
    ) {
      return <Variant.Icon asset={node as AssetRow} {...rest} />;
    } else if (Asset.Assert.isWindRelated(node.type)) {
      return <Wind.Icon asset={node as AssetRow} {...rest} />;
    } else if (Asset.Assert.isMonitoringPoint(node.type)) {
      return <MonitoringPoint.Icon monitoringPoint={node as MonitoringPointRow} {...rest} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
