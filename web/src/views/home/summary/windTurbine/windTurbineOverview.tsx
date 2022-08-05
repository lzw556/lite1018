import { Col, Form, Row, Spin } from 'antd';
import * as React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { AssetNavigator } from '../../components/assetNavigator';
import '../../home.css';
import { getAsset, updateAsset } from '../../assetList/services';
import { OverviewPage } from '../../components/overviewPage';
import { getAssetStatistics, NameValue } from '../../common/statisticsHelper';
import { MeasurementOfWindList } from '../../measurementList/measurementOfWindList';
import ShadowCard from '../../../../components/shadowCard';
import { Asset, AssetRow, convertRow } from '../../assetList/props';
import { MonitorTabContent } from './monitorTabContent';
import { SettingsTabContent } from '../settingsTabContent';
import usePermission, { Permission } from '../../../../permission/permission';
import { isMobile } from '../../../../utils/deviceDetection';
import { ActionBar } from '../../components/actionBar';
import { useActionBarStatus } from '../../common/useActionBarStatus';
import { AssetTypes } from '../../common/constants';

const WindTurbineOverview: React.FC = () => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [form] = Form.useForm<Asset>();
  const [isForceRefresh, setIsForceRefresh] = React.useState(0);
  const { hasPermission } = usePermission();
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

  const tabs = [
    {
      key: 'monitor',
      tab: '监控',
      content: <MonitorTabContent asset={asset} pathname={pathname} search={search} />
    },
    {
      key: 'list',
      tab: '监测点列表',
      content: (
        <ShadowCard>
          {asset && hasPermission(Permission.AssetAdd) && (
            <div style={{ position: 'fixed', top: isMobile ? 550 : 240, right: 25, zIndex: 10 }}>
              <ActionBar
                assets={[asset]}
                {...actionStatus}
                onEdit={actionStatus.handleEdit}
                initialValues={{ ...AssetTypes.Flange, parent_id: asset.id }}
                assetId={asset.id}
                onSuccess={() => fetchAsset(id)}
                hides={[true, false, false, true, true]}
              />
            </div>
          )}
          <Row>
            <Col span={24}>
              <MeasurementOfWindList
                wind={asset}
                pathname={pathname}
                search={search}
                open={actionStatus.handleEdit}
                fetchAssets={() => {
                  fetchAsset(id);
                }}
              />
            </Col>
          </Row>
        </ShadowCard>
      )
    }
  ];

  return (
    <>
      {asset && (
        <AssetNavigator id={asset.id} parentId={asset.parentId} isForceRefresh={isForceRefresh} />
      )}
      <OverviewPage
        {...{
          statistics,
          tabs: hasPermission(Permission.AssetEdit)
            ? tabs.concat([
                {
                  key: 'settings',
                  tab: '配置信息',
                  content: (
                    <SettingsTabContent
                      asset={asset}
                      form={form}
                      onSubmit={(values) => {
                        updateAsset(id, values).then(() => {
                          setIsForceRefresh((prev) => ++prev);
                        });
                      }}
                    />
                  )
                }
              ])
            : tabs
        }}
      />
    </>
  );
};

export default WindTurbineOverview;
