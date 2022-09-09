import { Button, Empty, message, Select, Spin } from 'antd';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AssetTypes } from '../common/constants';
import { getAssets, importAssets } from '../assetList/services';
import Label from '../../../components/label';
import { SearchResultPage } from '../components/searchResultPage';
import { MeasurementOfWindList } from './measurementOfWindList';
import { AssetRow } from '../assetList/props';
import { getProject } from '../../../utils/session';
import { ActionBar } from '../components/actionBar';
import { useActionBarStatus } from '../common/useActionBarStatus';
import usePermission, { Permission } from '../../../permission/permission';
import { useStore } from '../../../hooks/store';
import { PlusOutlined } from '@ant-design/icons';
import { AssetExport } from '../components/assetExport';
import { FileInput } from '../components/fileInput';

const MeasurementManagement: React.FC = () => {
  const { pathname, search } = useLocation();
  const [assets, setAssets] = React.useState<{
    loading: boolean;
    items: AssetRow[];
  }>({
    loading: true,
    items: []
  });
  const [store, setStore] = useStore('measurementListFilters');

  const [wind, setWind] = React.useState<AssetRow>();
  const actionStatus = useActionBarStatus();
  const { hasPermission } = usePermission();

  React.useEffect(() => {
    localStorage.setItem('prevProjectId', getProject());
    fetchAssets({ type: AssetTypes.WindTurbind.id });
  }, []);

  React.useEffect(() => {
    if (assets.items.length > 0) {
      if (store.windTurbineId) {
        const asset = assets.items.find((asset) => asset.id === store.windTurbineId);
        setWind(asset ? asset : assets.items[0]);
      } else {
        setWind(assets.items[0]);
      }
    }
  }, [store, assets]);

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => {
      setAssets({ loading: false, items: assets });
    });
  };

  const getSelectedWind = () => {
    if (assets.items.length > 0) {
      if (store.windTurbineId) {
        const wind = assets.items.find((asset) => asset.id === store.windTurbineId);
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
            setStore((prev) => ({ ...prev, windTurbineId: val }));
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
        handleMeasurementEdit={actionStatus.handleMeasurementEdit}
        fetchAssets={fetchAssets}
      />
    );
  };

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success('导入成功');
        fetchAssets({ type: AssetTypes.WindTurbind.id });
      } else {
        message.error(`导入失败: ${res.data.msg}`);
      }
    });
  };

  return (
    <SearchResultPage
      {...{
        filters: generateFilters(),
        actions: hasPermission(Permission.AssetAdd) && (
          <ActionBar
            actions={[
              <Button type='primary' onClick={() => actionStatus.handleWindEdit()}>
                添加风机
                <PlusOutlined />
              </Button>,
              <Button
                type='primary'
                onClick={() => actionStatus.handleFlangeEdit()}
                disabled={assets.items.length === 0}
              >
                添加法兰
                <PlusOutlined />
              </Button>,
              <Button
                type='primary'
                onClick={() => actionStatus.handleMeasurementEdit()}
                disabled={
                  assets.items.filter((asset) => asset.children && asset.children.length > 0)
                    .length === 0
                }
              >
                添加监测点
                <PlusOutlined />
              </Button>,
              assets.items.length > 0 && <AssetExport winds={assets.items} />,
              <FileInput onUpload={handleUpload} />
            ]}
            {...actionStatus}
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
