import * as React from 'react';
import { FindDeviceDataRequest } from '../../../apis/device';

export const useFindingDeviceData = (
  id: number,
  data_type: number,
  from: number,
  to: number
): [boolean, { timestamp: number }[]] => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<{ timestamp: number }[]>([]);

  React.useEffect(() => {
    setIsLoading(true);
    if (from && to) {
      FindDeviceDataRequest(id, from, to, { data_type })
        .then((data) => {
          setIsLoading(false);
          setData(data);
        })
        .catch((_) => {
          setIsLoading(false);
        });
    }
  }, [id, from, to, data_type]);

  return [isLoading, data];
};
