import { Button, Col, Form, Row, Spin } from 'antd';
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
import { ActionBar } from '../../components/actionBar';
import { useActionBarStatus } from '../../common/useActionBarStatus';
import { PlusOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';

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
  const tabs = [
    {
      key: 'monitor',
      tab: intl.get('MONITOR'),
      content: <MonitorTabContent asset={asset} pathname={pathname} search={search} />
    },
    {
      key: 'list',
      tab: intl.get('MONITORING_POINT_LIST'),
      content: (
        <ShadowCard>
          <Row>
            <Col span={24}>
              <MeasurementOfWindList
                wind={asset}
                pathname={pathname}
                search={search}
                handleMeasurementEdit={actionStatus.handleMeasurementEdit}
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
  const [tabKey, setTabKey] = React.useState(tabs[0].key);

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
          ['danger', 'MONITORING_POINT_DANGER'],
          ['warn', 'MONITORING_POINT_WARN'],
          ['info', 'MONITORING_POINT_INFO'],
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
          tabs: hasPermission(Permission.AssetEdit)
            ? tabs.concat([
                {
                  key: 'settings',
                  tab: intl.get('SETTINGS'),
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
            : tabs,
          tabBarExtraContent: asset && tabKey === 'list' && hasPermission(Permission.AssetAdd) && (
            <ActionBar
              actions={[
                <Button type='primary' onClick={() => actionStatus.handleFlangeEdit({ asset })}>
                  {intl.get('CREATE_FLANGE')}
                  <PlusOutlined />
                </Button>,
                <Button
                  type='primary'
                  onClick={() => actionStatus.handleAddMeasurements({ asset })}
                  disabled={!asset.children || asset.children.length === 0}
                >
                  {intl.get('CREATE_MONITORING_POINT')}
                  <PlusOutlined />
                </Button>
              ]}
              {...actionStatus}
              onSuccess={() => fetchAsset(id)}
            />
          ),
          onTabChange: (key) => setTabKey(key)
        }}
      />
    </>
  );
};

export default WindTurbineOverview;
