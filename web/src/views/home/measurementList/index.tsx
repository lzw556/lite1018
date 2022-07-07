import { Empty, Select, Spin } from 'antd';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AssetTypes } from '../common/constants';
import { getAssets } from '../assetList/services';
import Label from '../../../components/label';
import { SearchResultPage } from '../components/searchResultPage';
import { MeasurementOfWindList } from './measurementOfWindList';
import { AssetRow } from '../assetList/props';
import { getProject } from '../../../utils/session';
import { ActionBar } from '../components/actionBar';
import { useActionBarStatus } from '../common/useActionBarStatus';

const MeasurementManagement: React.FC = () => {
  const { pathname, search } = useLocation();
  const [assets, setAssets] = React.useState<{
    loading: boolean;
    items: AssetRow[];
  }>({
    loading: true,
    items: []
  });
  const local = localStorage.getItem('measurementListFilters');
  const localObj: { windTurbineId: number } = local ? JSON.parse(local) : null;
  const [filters, setFilters] = React.useState<{ windTurbineId: number } | undefined>(
    localObj ? localObj : undefined
  );
  const [wind, setWind] = React.useState<AssetRow>();
  const actionStatus = useActionBarStatus();

  React.useEffect(() => {
    localStorage.setItem('prevProjectId', getProject());
    fetchAssets({ type: AssetTypes.WindTurbind.id });
  }, []);

  React.useEffect(() => {
    if (assets.items.length > 0) {
      if (filters) {
        const asset = assets.items.find((asset) => asset.id === filters.windTurbineId);
        setWind(asset ? asset : assets.items[0]);
      } else {
        setWind(assets.items[0]);
      }
    }
  }, [filters, assets]);

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => {
      setAssets({ loading: false, items: assets });
    });
  };

  const getSelectedWind = () => {
    if (assets.items.length > 0) {
      if (filters?.windTurbineId) {
        const wind = assets.items.find((asset) => asset.id === filters?.windTurbineId);
        if (wind) return wind.id;
      }
      return assets.items[0].id;
    }
  };

  const generateFilters = () => {
    if (assets.items.length === 0) return undefined;
    return [
      <Label name='风机'>
        <Select
          bordered={false}
          onChange={(val) => {
            setFilters((prev) => ({ ...prev, windTurbineId: val }));
            localStorage.setItem('measurementListFilters', JSON.stringify({ windTurbineId: val }));
          }}
          defaultValue={getSelectedWind()}
        >
          {assets.items.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Label>
    ];
  };

  const renderResult = () => {
    if (assets.loading) return <Spin />;
    if (assets.items.length === 0)
      return <Empty description='没有资产' image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <MeasurementOfWindList
        wind={wind}
        pathname={pathname}
        search={search}
        open={actionStatus.handleEdit}
        fetchAssets={fetchAssets}
      />
    );
  };

  return (
    <SearchResultPage
      {...{
        filters: generateFilters(),
        actions: (
          <ActionBar
            assets={assets.items}
            {...actionStatus}
            onEdit={actionStatus.handleEdit}
            // assetId={filters?.windTurbineId}
            onSuccess={() => fetchAssets({ type: AssetTypes.WindTurbind.id })}
          />
        ),
        results: renderResult()
      }}
    />
  );
};

export default MeasurementManagement;
