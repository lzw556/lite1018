import * as React from 'react';
import { GetDeviceDataRequest } from '../../../apis/device';
import {
  DYNAMIC_DATA_ANGLEDIP,
  DYNAMIC_DATA_BOLTELONGATION
} from '../detail/dynamicData/constants';

export type Values_be = typeof DYNAMIC_DATA_BOLTELONGATION.fields[number]['value'];
export type Values_ad = typeof DYNAMIC_DATA_ANGLEDIP.fields[number]['value'];

export type Values = (Record<Values_be, number[]> | Record<Values_ad, number[]>) & { metadata: any };

export const useGetingDeviceData = (): [
  boolean,
  { timestamp: number; values: Values } | null,
  (id: number, timestamp: number, filters: any) => void
] => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const fetchDeviceDataByTimestamp = React.useCallback(
    (id: number, timestamp: number, filters: any) => {
      setIsLoading(true);
      GetDeviceDataRequest(id, timestamp, filters)
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

  return [isLoading, data, fetchDeviceDataByTimestamp];
};
