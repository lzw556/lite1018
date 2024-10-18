import React from 'react';
import { useParams } from 'react-router-dom';
import { AssetRow } from '../types';
import { getAsset, getAssets } from '../services';
import { getMeasurement, MonitoringPointRow } from '../monitoring-point';
import { getVirturalAsset } from '../constants';

export type ContextProps = {
  assets: AssetRow[];
  assetsLoading: boolean;
  loading: boolean;
  refresh: (flag?: boolean) => void;
  selectedNode: AssetRow | MonitoringPointRow | undefined;
};

const Context = React.createContext<ContextProps>({
  assets: [],
  assetsLoading: false,
  loading: false,
  refresh: () => {},
  selectedNode: undefined
});

export const useContext = () => React.useContext(Context);

export function ContextProvider({ children }: { children?: JSX.Element }) {
  const { id: pathId = getVirturalAsset().homePathId } = useParams();
  const [idStr, typeStr] = pathId.split('-');
  const id = Number(idStr);
  const type = Number(typeStr);
  const [assets, setAssets] = React.useState<ContextProps['assets']>([]);
  const [loading, setLoading] = React.useState(false);
  const [assetsLoading, setAssetsLoading] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<ContextProps['selectedNode']>();

  const fetchAssets = () => {
    setAssetsLoading(true);
    getAssets({ parent_id: 0 })
      .then(setAssets)
      .finally(() => setAssetsLoading(false));
  };

  React.useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAsset = (id: number) => {
    setLoading(true);
    getAsset(id)
      .then(setSelectedNode)
      .finally(() => setLoading(false));
  };

  const fetchPoint = (id: number) => {
    setLoading(true);
    getMeasurement(id)
      .then(setSelectedNode)
      .finally(() => setLoading(false));
  };

  const fetchNode = React.useCallback((id: number, type: number) => {
    if (id > 0 && !Number.isNaN(id)) {
      if (type < 10000) {
        fetchAsset(id);
      } else {
        fetchPoint(id);
      }
    }
  }, []);

  const refresh = React.useCallback(
    (flag?: boolean) => {
      if (flag) {
        fetchAssets();
      } else {
        fetchAssets();
        fetchNode(id, type);
      }
    },
    [id, type, fetchNode]
  );

  React.useEffect(() => {
    fetchNode(id, type);
  }, [id, type, fetchNode]);

  return (
    <Context.Provider value={{ assets, assetsLoading, loading, refresh, selectedNode }}>
      {children}
    </Context.Provider>
  );
}
