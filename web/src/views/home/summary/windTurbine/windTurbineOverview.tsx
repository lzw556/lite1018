import { Button, Col, Empty, Form, Row, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { AssetNavigator } from '../../components/assetNavigator';
import '../../home.css';
import { getAsset, updateAsset } from '../../assetList/services';
import { MeasurementRow } from '../measurement/props';
import { OverviewPage } from '../../components/overviewPage';
import { getAssetStatistics, NameValue } from '../../common/statisticsHelper';
import { MeasurementOfWindList } from '../../measurementList/measurementOfWindList';
import { MeasurementEdit } from '../../measurementList/edit';
import { PlusOutlined } from '@ant-design/icons';
import ShadowCard from '../../../../components/shadowCard';
import { Asset, AssetRow, convertRow } from '../../assetList/props';
import { MonitorTabContent } from './monitorTabContent';
import { SettingsTabContent } from '../settingsTabContent';

const WindTurbineOverview: React.FC = () => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MeasurementRow>();
  const [form] = Form.useForm<Asset>();
  const [isForceRefresh, setIsForceRefresh] = React.useState(0);

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

  const open = (selectedRow?: MeasurementRow) => {
    setSelectedRow(selectedRow);
    setVisible(true);
  };

  if (loading) return <Spin />;
  if (!asset || !asset.children || asset.children.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有法兰, 去<Link to='/asset-management?locale=asset-management'>创建</Link>, 或
            <Link to={`/project-overview?locale=project-overview`}>返回</Link>
          </p>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <>
      {asset && (
        <AssetNavigator id={asset.id} parentId={asset.parentId} isForceRefresh={isForceRefresh} />
      )}
      <OverviewPage
        {...{
          statistics,
          tabs: [
            {
              key: 'monitor',
              tab: '监控',
              content: <MonitorTabContent asset={asset} pathname={pathname} search={search} />
            },
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
            },
            {
              key: 'list',
              tab: '监测点列表',
              content: (
                <ShadowCard>
                  <Row>
                    <Col span={24}>
                      <Button
                        type='primary'
                        style={{ position: 'fixed', top: 240, right: 25, zIndex: 10 }}
                        onClick={() => open()}
                      >
                        添加监测点
                        <PlusOutlined />
                      </Button>
                    </Col>
                    <Col span={24}>
                      <MeasurementOfWindList
                        wind={asset}
                        pathname={pathname}
                        search={search}
                        open={open}
                        fetchAssets={() => {
                          fetchAsset(id);
                        }}
                      />
                      {visible && (
                        <MeasurementEdit
                          {...{
                            visible,
                            onCancel: () => setVisible(false),
                            id: selectedRow?.id,
                            assetId: asset.id,
                            onSuccess: () => {
                              fetchAsset(id);
                              setVisible(false);
                            }
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </ShadowCard>
              )
            }
          ]
        }}
      />
    </>
  );
};

export default WindTurbineOverview;
