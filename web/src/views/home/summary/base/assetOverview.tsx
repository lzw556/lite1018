import { Form, Spin } from 'antd';
import * as React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { AssetNavigator } from '../../components/assetNavigator';
import '../../home.css';
import { getAsset } from '../../assetList/services';
import { OverviewPage } from '../../components/overviewPage';
import { getAssetStatistics, NameValue } from '../../common/statisticsHelper';
import ShadowCard from '../../../../components/shadowCard';
import { Asset, AssetRow, convertRow } from '../../assetList/props';
import { ActionBar } from '../../components/actionBar';
import { useActionBarStatus } from '../../common/useActionBarStatus';
import { AssetTree } from '../../assetList/assetTree';

const AssetOverview: React.FC = () => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [form] = Form.useForm<Asset>();
  const [isForceRefresh, setIsForceRefresh] = React.useState(0);
  const actionStatus = useActionBarStatus();

  const fetchAsset = (id: number, form?: any) => {
    getAsset(id).then((asset) => {
      setLoading(false);
      setAsset(asset);
      if (form) form.setFieldsValue(convertRow(asset));
    });
  };

  React.useEffect(() => {
    fetchAsset(id, form);
  }, [id, form]);

  React.useEffect(() => {
    if (asset) {
      const { statistics } = asset;
      setStatistics(
        getAssetStatistics(
          statistics,
          'monitoringPointNum',
          ['danger', '紧急报警监测点'],
          ['warn', '重要报警监测点'],
          ['info', '次要报警监测点'],
          'deviceNum',
          'offlineDeviceNum'
        ).statistics
      );
    }
  }, [asset, pathname, search, history]);

  if (loading) return <Spin />;

  return (
    <>
      {asset && (
        <AssetNavigator id={asset.id} parentId={asset.parentId} isForceRefresh={isForceRefresh} />
      )}
      <OverviewPage
        {...{
          statistics,
          children: (
            <ShadowCard>
              <ActionBar
                actions={[]}
                {...actionStatus}
                style={{ display: 'none' }}
                onSuccess={() => {
                  fetchAsset(id, form);
                  setIsForceRefresh(1);
                }}
              />
              <AssetTree
                assets={asset ? [asset] : []}
                pathname={pathname}
                search={search}
                onsuccess={() => fetchAsset(id, form)}
                {...actionStatus}
                rootId={asset?.id}
                key={asset?.id}
              />
            </ShadowCard>
          )
        }}
      />
    </>
  );
};

export default AssetOverview;
