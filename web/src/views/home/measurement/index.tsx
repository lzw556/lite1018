import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Popconfirm, Space, Spin, TableProps } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetTypes, MeasurementTypes } from '../constants';
import { AssetRow } from '../asset/props';
import { getAssets } from '../asset/services';
import { SearchResultPage } from '../searchResultPage';
import { MeasurementEdit } from './edit';
import { MeasurementRow } from './props';
import { deleteMeasurement, getMeasurements } from './services';

const MeasurementManagement: React.FC = () => {
  const [assets, setAssets] = React.useState<{
    loading: boolean;
    items: AssetRow[];
  }>({
    loading: true,
    items: []
  });
  const [measurements, setMeasurements] = React.useState<{
    loading: boolean;
    items: MeasurementRow[];
  }>({
    loading: true,
    items: []
  });
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MeasurementRow>();
  const actions: ButtonProps[] = [
    {
      type: 'primary',
      children: React.Children.toArray(['添加监测点', <PlusOutlined />]),
      onClick: () => open()
    }
  ];
  const [result, setResult] = React.useState<TableProps<any>>({
    rowKey: 'id',
    columns: [
      { title: '名称', dataIndex: 'name', key: 'name', width: '50%' },
      {
        title: '类型',
        key: 'type',
        width: 120,
        render: (row: MeasurementRow) => {
          const type = Object.values(MeasurementTypes).find((type) => type.type === row.type);
          return type ? type.label : '-';
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (row: MeasurementRow) => (
          <Space>
            <Button type='text' size='small' title='编辑监测点'>
              <EditOutlined onClick={() => open(row)} />
            </Button>
            <Popconfirm
              title={'确定要删除该监测点吗?'}
              onConfirm={() => {
                deleteMeasurement(row.id).then(() => {
                  fetchMeasurements();
                });
              }}
            >
              <Button type='text' danger={true} size='small' title='删除监测点'>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    size: 'small',
    pagination: false,
    loading: true,
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
  });
  const [hasAssets, setHasAssets] = React.useState(false);

  const open = (selectedRow?: MeasurementRow) => {
    setSelectedRow(selectedRow);
    setVisible(true);
  };
  const fetchMeasurements = (filters?: Pick<MeasurementRow, 'type'>) => {
    setMeasurements((prev) => ({ ...prev, loading: true }));
    getMeasurements().then((measurements) =>
      setMeasurements({ loading: false, items: measurements })
    );
  };
  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => setAssets({ loading: false, items: assets }));
  };
  React.useEffect(() => {
    fetchAssets({ type: AssetTypes.WindTurbind.type });
  }, []);

  React.useEffect(() => {
    if (!assets.loading) setHasAssets(assets.items.length > 0);
  }, [assets]);

  React.useEffect(() => {
    if (hasAssets) fetchMeasurements();
  }, [hasAssets]);

  React.useEffect(() => {
    setResult((prev) => ({
      ...prev,
      dataSource: measurements.items,
      loading: measurements.loading
    }));
  }, [measurements]);

  if (assets.loading) {
    return <Spin />;
  } else if (!hasAssets) {
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
    <SearchResultPage {...{ actions, result }}>
      {visible && (
        <MeasurementEdit
          {...{
            visible,
            onCancel: () => setVisible(false),
            selectedRow,
            onSuccess: () => {
              fetchMeasurements();
              setVisible(false);
            }
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default MeasurementManagement;
