import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Popconfirm, Space, Spin, TableProps } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetTypes, MeasurementTypes } from '../asset/constants';
import { AssetRow } from '../asset/props';
import { getAssets } from '../asset/services';
import { SearchResultPage } from '../searchResultPage';
import { MeasurementEdit } from './edit';
import { MeasurementRow } from './props';
import { deleteMeasurement, getMeasurements } from './services';

const MeasurementManagement: React.FC = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
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
    rowKey: 'ID',
    columns: [
      { title: '名称', dataIndex: 'Name', key: 'name', width: '50%' },
      {
        title: '类型',
        key: 'type',
        width: 120,
        render: (row: MeasurementRow) => {
          const type = Object.values(MeasurementTypes).find((type) => type.type === row.Type);
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
                deleteMeasurement(row.ID).then(() => {
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
    loading: !isLoaded,
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
  });
  const [measurements, setMeasurements] = React.useState<MeasurementRow[]>([]);
  const [assets, setAssets] = React.useState<AssetRow[]>([]);
  const [hasAssets, setHasAssets] = React.useState(false);

  const open = (selectedRow?: MeasurementRow) => {
    setSelectedRow(selectedRow);
    setVisible(true);
  };
  const fetchMeasurements = () => {
    setIsLoaded(false);
    getMeasurements()
      .then(setMeasurements)
      .then(() => setIsLoaded(true));
  };
  React.useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = () => {
    setIsLoaded(false);
    getAssets()
      .then(setAssets)
      .then(() => setIsLoaded(true));
  };

  React.useEffect(() => {
    if (
      isLoaded &&
      assets.filter((asset) => asset.Type === AssetTypes.WindTurbind.type).length > 0
    ) {
      setHasAssets(true);
    }
  }, [assets, isLoaded]);

  React.useEffect(() => {
    if (hasAssets) fetchMeasurements();
  }, [hasAssets]);

  React.useEffect(() => {
    setResult((prev) => ({
      ...prev,
      dataSource: measurements,
      loading: !isLoaded
    }));
  }, [measurements, isLoaded]);

  if (!isLoaded) {
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
