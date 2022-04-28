import * as React from 'react';
import { GetDeviceDataRequest } from '../../../apis/device';
import {
  AXIS_THREE,
  DYNAMIC_DATA_ANGLEDIP,
  DYNAMIC_DATA_BOLTELONGATION
} from '../detail/dynamicData/constants';

export type Fields_be = typeof DYNAMIC_DATA_BOLTELONGATION.fields[number]['value'];
export const fields_be_hasAxis = 'dynamic_acceleration';
type Fields_be_hasAxis = typeof fields_be_hasAxis;
type Fields_be_noHasAxis = Exclude<Fields_be, Fields_be_hasAxis>;
export type Fields_be_axis = Record<typeof AXIS_THREE[number]['value'], number>;
export type Values_be = Record<Fields_be_noHasAxis, number[]> & {
  [fields_be_hasAxis]: Fields_be_axis[];
};
export type Fields_ad = typeof DYNAMIC_DATA_ANGLEDIP.fields[number]['value'];
export type Values_ad = Record<Fields_ad, number[]>;
export const useGetingDeviceData = <T>(): [
  boolean,
  { timestamp: number; values: T } | null,
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
