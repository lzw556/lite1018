import moment from 'moment';
import * as React from 'react';
import { PagedOption } from '../types/props';
import { Filters } from '../views/device/util';

export type Store = {
  deviceList: { filters?: Filters; pagedOptions: PagedOption; searchTarget: number };
  measurementListFilters: { windTurbineId: number };
  networkList: { pagedOptions: PagedOption };
  firmwareList: { pagedOptions: PagedOption };
  alarmRecordList: { pagedOptions: PagedOption; range: [number, number]; alertLevels: number[] };
  projectList: { pagedOptions: PagedOption };
  accountList: { pagedOptions: PagedOption };
};

export function useStore<ReturnType extends keyof Store>(
  key: ReturnType
): [Store[typeof key], React.Dispatch<React.SetStateAction<Store[typeof key]>>] {
  const defaultPagedOptions = { pagedOptions: { index: 1, size: 10 } };
  console.log(`moment().subtract(1, 'd').startOf('day').utc().unix()`, moment().subtract(1, 'd').startOf('day').utc().unix())
  console.log(`moment().endOf('day').utc().unix()`, moment().endOf('day').utc().unix())
  const initial = JSON.stringify({
    deviceList: {
      ...defaultPagedOptions,
      searchTarget: 0
    },
    measurementListFilters: { windTurbineId: 0 },
    networkList: { ...defaultPagedOptions },
    firmwareList: { ...defaultPagedOptions },
    alarmRecordList: {
      ...defaultPagedOptions,
      alertLevels: [1, 2, 3],
      range: [
        moment().subtract(1, 'd').startOf('day').utc().unix(),
        moment().endOf('day').utc().unix()
      ]
    },
    projectList: { ...defaultPagedOptions },
    accountList: { ...defaultPagedOptions }
  });
  
  const local = localStorage.getItem('store') || initial;
  const localStore = JSON.parse(local) as Store;
  const [subStore, setSubStore] = React.useState<Store[typeof key]>(localStore[key]);

  React.useEffect(() => {
    localStorage.setItem('store', JSON.stringify({ ...localStore, [key]: subStore }));
  }, [localStore, subStore, key]);

  return [subStore, setSubStore];
}
