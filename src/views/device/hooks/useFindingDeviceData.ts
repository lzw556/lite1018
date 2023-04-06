import * as React from 'react';
import { FindDeviceDataRequest } from '../../../apis/device';

export const useFindingDeviceData = (
  range?: [number, number]
): [boolean, { timestamp: number }[], (id: number, filters: any) => void] => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState([]);
  const fetchDeviceWaveDataTimestamps = React.useCallback(
    (id: number, filters: any) => {
      setIsLoading(true);
      if (range) {
        const [from, to] = range;
        FindDeviceDataRequest(id, from, to, filters)
          .then((data: any) => {
            setIsLoading(false);
            setData(data);
          })
          .catch((_) => {
            setIsLoading(false);
          });
      }
    },
    [range]
  );

  return [isLoading, data, fetchDeviceWaveDataTimestamps];
};
