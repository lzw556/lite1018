import * as React from 'react';
import { PagedOption } from '../types/props';
import { Filters } from '../views/device/util';

export type Store = {
  deviceList: { filters?: Filters; pagedOptions: PagedOption; searchTarget: number };
  measurementListFilters: { windTurbineId: number };
};

export function useStore<ReturnType extends keyof Store>(
  key: ReturnType
): [Store[typeof key], React.Dispatch<React.SetStateAction<Store[typeof key]>>] {
  
  const initial = JSON.stringify({
    deviceList: {
      pagedOptions: { index: 1, size: 10 },
      searchTarget: 0
    },
    measurementListFilters: { windTurbineId: 0 }
  });
  const local = localStorage.getItem('store') || initial;
  const localStore = JSON.parse(local) as Store;
  const [subStore, setSubStore] = React.useState<Store[typeof key]>(localStore[key]);

  React.useEffect(() => {
    localStorage.setItem('store', JSON.stringify({ ...localStore, [key]: subStore }));
  }, [localStore, subStore, key]);
  
  return [subStore, setSubStore];
}
