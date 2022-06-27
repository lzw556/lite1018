import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Select, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssetTypes } from '../common/constants';
import { AssetRow } from '../asset/props';
import { getAssets } from '../asset/services';
import { MeasurementEdit } from './edit';
import { MeasurementRow } from './props';
import Label from '../../../components/label';
import { SearchResultPage } from '../components/searchResultPage';
import { MeasurementList } from './measurementList';

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
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MeasurementRow>();

  const open = (selectedRow?: MeasurementRow) => {
    setSelectedRow(selectedRow);
    setVisible(true);
  };

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => setAssets({ loading: false, items: assets }));
  };
  React.useEffect(() => {
    fetchAssets({ type: AssetTypes.WindTurbind.id });
  }, []);

  React.useEffect(() => {
    if (assets.items.length > 0 && !filters) {
      setFilters((prev) => ({ ...prev, windTurbineId: assets.items[0].id }));
    }
    if (filters) {
      localStorage.setItem('measurementListFilters', JSON.stringify(filters));
      setWind(assets.items.find((asset) => asset.id === filters.windTurbineId));
    }
  }, [filters, assets]);

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
    if (assets.items.length > 0) {
      return [
        <Label name='风机'>
          <Select
            bordered={false}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, windTurbineId: val }));
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
    } else {
      return [];
    }
  };

  if (assets.loading) {
    return <Spin />;
  } else if (assets.items.length === 0) {
    return (
      <Empty
        description={
          <p>
            还没有风机, 去<Link to='/asset-management?locale=asset-management'>创建</Link>
          </p>
        }
      />
    );
  }

  return (
    <SearchResultPage
      {...{
        filters: generateFilters(),
        actions: (
          <Button
            type='primary'
            style={{ position: 'fixed', top: 75, right: 25, zIndex: 10 }}
            onClick={() => open()}
          >
            添加监测点
            <PlusOutlined />
          </Button>
        ),
        results: (
          <MeasurementList
            wind={wind}
            pathname={pathname}
            search={search}
            open={open}
            fetchAssets={fetchAssets}
          />
        )
      }}
    >
      {visible && (
        <MeasurementEdit
          {...{
            visible,
            onCancel: () => setVisible(false),
            selectedRow,
            onSuccess: () => {
              fetchAssets({ type: AssetTypes.WindTurbind.id });
              setVisible(false);
            }
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default MeasurementManagement;
