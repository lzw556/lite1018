import React from 'react';
import { Asset, Point, useContext } from '../asset-common';
import * as Area from '../asset-area';
import * as Vibration from '../app-vibration';
import * as Corrosion from '../app-corrosion';
import * as Wind from '../app-wind-turbine';

export default function Main() {
  const contextProps = useContext();
  const { selectedNode } = contextProps;

  if (selectedNode) {
    const { type } = selectedNode;
    if (Asset.Assert.isArea(type)) {
      return <Area.Main {...contextProps} />;
    } else if (Asset.Assert.isVibrationRelated(type) || Point.Assert.isVibrationRelated(type)) {
      return <Vibration.Index {...contextProps} />;
    } else if (Asset.Assert.isCorrosionRelated(type) || Point.Assert.isCorrosionRelated(type)) {
      return <Corrosion.Index {...contextProps} />;
    } else if (Asset.Assert.isWindRelated(type) || Point.Assert.isWindRelated(type)) {
      return <Wind.Main {...contextProps} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
