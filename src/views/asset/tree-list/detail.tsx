import React from 'react';
import { useParams } from 'react-router-dom';
import { Empty, Spin } from 'antd';
import intl from 'react-intl-universal';
import './tree.css';
import { AssertAssetCategory, AssertOfAssetCategory, AssetRow } from '../types';
import { getAsset } from '../services';
import { getMeasurement, MonitoringPointRow } from '../../monitoring-point';
import WindTurbineShow from '../show';
import FlangeShow from '../../flange/show';
import TowerShow from '../../tower/show';
import MonitoringPointShow from '../../monitoring-point/show';

export default function AssetDetail() {
  const { id: pathId } = useParams();
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(false);
  const [monitoringPoint, setMonitoringPoint] = React.useState<MonitoringPointRow>();
  const [loading2, setLoading2] = React.useState(false);

  const fetchAsset = (id: number) => {
    setLoading(true);
    getAsset(id).then((asset) => {
      setLoading(false);
      setAsset(asset);
    });
  };

  const fetchPoint = (id: number) => {
    setLoading2(true);
    getMeasurement(id).then((point) => {
      setLoading2(false);
      setMonitoringPoint(point);
    });
  };

  React.useEffect(() => {
    if (pathId) {
      const [idStr, typeStr] = pathId.split('-');
      const id = Number(idStr);
      const type = Number(typeStr);
      if (type < 10000) {
        fetchAsset(Number(id));
      } else {
        fetchPoint(Number(id));
      }
    }
  }, [pathId]);

  if (loading || loading2) {
    return <Spin />;
  }
  if (asset === undefined && monitoringPoint === undefined) {
    return (
      <Empty
        description={intl.get('PLEASE_SELECT_AN_ASSET')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  if (asset) {
    if (AssertAssetCategory(asset.type, AssertOfAssetCategory.IS_FLANGE)) {
      return <FlangeShow flange={asset} fetchFlange={fetchAsset} />;
    } else if (AssertAssetCategory(asset.type, AssertOfAssetCategory.IS_TOWER)) {
      return <TowerShow tower={asset} fetchTower={fetchAsset} />;
    } else {
      return <WindTurbineShow asset={asset} fetchAsset={fetchAsset} />;
    }
  } else if (monitoringPoint) {
    return <MonitoringPointShow monitoringPoint={monitoringPoint} fetchPoint={fetchPoint} />;
  } else {
    return null;
  }
}
