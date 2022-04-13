import * as React from 'react';
import { FindDeviceDataRequest } from '../../../apis/device';

export const useFindingDeviceData = (): [
  boolean,
  {timestamp:number}[],
  (id: number, from: number, to: number, filters: any) => void
] => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState([]);
  const fetchDeviceWaveDataTimestamps = React.useCallback(
    (id: number, from: number, to: number, filters: any) => {
      setIsLoading(true);
      FindDeviceDataRequest(id, from, to, filters)
        .then((data: any) => {
          setIsLoading(false);
          setData(data);
        })
        .catch((_) => {
          setIsLoading(false);
        });
    },
    []
  );

  return [isLoading, data, fetchDeviceWaveDataTimestamps];
};
