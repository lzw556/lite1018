import * as React from 'react';
import { PagedOption } from '../types/props';
import { Filters } from '../views/device/util';
import { oneWeekNumberRange } from '../components/rangeDatePicker';

export type Store = {
  deviceList: {
    filters?: Filters;
    pagedOptions: PagedOption;
    searchTarget: number;
    lastUpdate: number;
  };
  measurementListFilters: { windTurbineId: number; pagedOptions: PagedOption; lastUpdate: number };
  networkList: { pagedOptions: PagedOption; lastUpdate: number };
  firmwareList: { pagedOptions: PagedOption; lastUpdate: number };
  alarmRecordList: {
    pagedOptions: PagedOption;
    range: [number, number];
    alertLevels: number[];
    lastUpdate: number;
  };
  monitoringPointAlarmRecordList: {
    pagedOptions: PagedOption;
    range: [number, number];
    alertLevels: number[];
    lastUpdate: number;
  };
  projectList: { pagedOptions: PagedOption; lastUpdate: number };
  accountList: { pagedOptions: PagedOption; lastUpdate: number };
  reportList: { pagedOptions: PagedOption; lastUpdate: number };
};

export function useStore<ReturnType extends keyof Store>(
  key: ReturnType
): [
  Store[typeof key],
  React.Dispatch<React.SetStateAction<Store[typeof key]>>,
  (pageInfo: { total: number; index: number; size: number }, action: 'prev' | 'next') => void
] {
  const defaultPagedOptions = { pagedOptions: { index: 1, size: 10 } };
  const lastUpdate = new Date().getTime();
  const defaultOptions = { ...defaultPagedOptions, lastUpdate };
  const initial = JSON.stringify({
    deviceList: {
      ...defaultOptions,
      searchTarget: 0
    },
    measurementListFilters: { ...defaultOptions, windTurbineId: 0 },
    networkList: { ...defaultOptions },
    firmwareList: { ...defaultOptions },
    alarmRecordList: {
      ...defaultOptions,
      alertLevels: [1, 2, 3],
      range: oneWeekNumberRange
    },
    monitoringPointAlarmRecordList: {
      ...defaultOptions,
      alertLevels: [1, 2, 3],
      range: oneWeekNumberRange
    },
    projectList: { ...defaultOptions },
    accountList: { ...defaultOptions },
    reportList: { ...defaultOptions }
  });

  const local = localStorage.getItem('store') || initial;
  const localStore = JSON.parse(local) as Store;
  const [subStore, setSubStore] = React.useState<Store[typeof key]>(
    localStore[key] ?? JSON.parse(initial)[key]
  );

  React.useEffect(() => {
    localStorage.setItem('store', JSON.stringify({ ...localStore, [key]: subStore }));
  }, [localStore, subStore, key]);

  function gotoPage(
    pageInfo: { total: number; index: number; size: number },
    action: 'prev' | 'next'
  ) {
    const { total, index, size } = pageInfo;
    const pageCount = Math.ceil((total + (action === 'next' ? 1 : -1)) / size);
    const nextIndex = action === 'next' ? pageCount : pageCount < index ? pageCount : index;
    if (nextIndex !== index) {
      setSubStore((prev) => ({
        ...prev,
        pagedOptions: { index: nextIndex, size: prev.pagedOptions.size }
      }));
    } else {
      setSubStore((prev) => ({ ...prev, lastUpdate: new Date().getTime() }));
    }
  }

  return [subStore, setSubStore, gotoPage];
}
