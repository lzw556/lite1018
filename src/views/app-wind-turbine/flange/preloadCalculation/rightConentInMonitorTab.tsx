import React from 'react';
import { AssetRow } from '../../../asset-common';
import { FakeVSRealChart } from './fakeVSRealChart';

export const RightConentInMonitorTab = ({ asset }: { asset: AssetRow }) => {
  return <FakeVSRealChart points={asset.monitoringPoints} />;
};
