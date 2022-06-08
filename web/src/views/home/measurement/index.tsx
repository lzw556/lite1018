import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  ButtonProps,
  Empty,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  TableProps
} from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetTypes, MeasurementTypes } from '../constants';
import { AssetRow } from '../asset/props';
import { getAssets } from '../asset/services';
import { SearchResultPage } from '../searchResultPage';
import { MeasurementEdit } from './edit';
import { MeasurementRow } from './props';
import { deleteMeasurement } from './services';
import { generatePropertyColumns, getAssetType } from '../utils';
import Label from '../../../components/label';

const MeasurementManagement: React.FC = () => {
  const [assets, setAssets] = React.useState<{
    loading: boolean;
    items: AssetRow[];
  }>({
    loading: true,
    items: []
  });
  const [conditions, setConditions] = React.useState<{ windTurbineId: number }>();
  const [wind, setWind] = React.useState<AssetRow>();
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MeasurementRow>();
  const actions: ButtonProps[] = [
    {
      type: 'primary',
      children: React.Children.toArray(['添加监测点', <PlusOutlined />]),
      onClick: () => open()
    }
  ];

  const generateTable = (dataSource: TableProps<any>['dataSource']) => {
    return (
      <Table
        {...{
          rowKey: 'id',
          columns: [
            {
              title: '法兰',
              dataIndex: 'assetId',
              onCell: (_, index) => {
                if (index === 0) return { rowSpan: 5 };
                return { rowSpan: 0 };
              },
              render: (data, row) => {
                const flange: AssetRow | undefined = wind?.children?.find(({ id }) => id === data);
                if (flange) {
                  const assetType = getAssetType(flange.type);
                  if (assetType)
                    return <Link to={`${assetType.url}&id=${flange.id}`}>{flange.name}</Link>;
                }
                return '';
              },
              width: 300
            },
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
              // width: 300,
              render: (name: string, row: MeasurementRow) => (
                <Link to={`${MeasurementTypes.dynamicPreload.url}&id=${row.id}`}>{name}</Link>
              )
            },
            {
              title: '序号',
              dataIndex: 'index',
              key: 'index',
              width: 100,
              render: (name: string, row: MeasurementRow) => row.attributes?.index
            },
            {
              title: '传感器',
              dataIndex: 'devices',
              key: 'devices',
              width: 200,
              render: (name: string, row: MeasurementRow) =>
                row.bindingDevices && row.bindingDevices.length > 0
                  ? row.bindingDevices.map(({ id, name }) => (
                      <Link to={`/device-management?locale=devices/deviceDetail&id=${id}`}>
                        {name}
                      </Link>
                    ))
                  : ''
            },
            ...generatePropertyColumns(dataSource ? dataSource[0] : []),
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
                        fetchAssets({ type: AssetTypes.WindTurbind.id });
                      });
                    }}
                  >
                    <Button type='text' danger={true} size='small' title='删除监测点'>
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </Space>
              ),
              width: 120
            }
          ],
          size: 'small',
          dataSource,
          pagination: false,
          locale: {
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' />
          },
          bordered: true
        }}
      />
    );
  };

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
    if (!assets.loading && !conditions) {
      setConditions((prev) => ({ ...prev, windTurbineId: assets.items[0].id }));
    }
    if (conditions) {
      setWind(assets.items.find((asset) => asset.id === conditions.windTurbineId));
    }
  }, [assets, conditions]);

  const generateTables = () => {
    if (!wind) return [];
    if (
      !wind.children ||
      wind.children.length === 0 ||
      (wind.children.length > 0 && wind.children.every(({ monitoringPoints }) => !monitoringPoints))
    )
      return [<Empty description='没有法兰或监测点' />];
    return wind.children
      .sort((prev, next) => {
        const { type: prevType } = prev.attributes || { index: 5, type: 4 };
        const { type: nextType } = next.attributes || { index: 5, type: 4 };
        return prevType - nextType;
      })
      .filter(({ monitoringPoints }) => monitoringPoints && monitoringPoints.length > 0)
      .map(({ monitoringPoints }) =>
        generateTable(
          monitoringPoints
            ? monitoringPoints.sort((prev, next) => {
                const { index: prevIndex } = prev.attributes || { index: 5, type: 4 };
                const { index: nextIndex } = next.attributes || { index: 5, type: 4 };
                return prevIndex - nextIndex;
              })
            : []
        )
      );
  };

  const generateFilters = () => {
    if (assets.items.length > 0) {
      return [
        <Label name='风机'>
          <Select
            bordered={false}
            onChange={(val) => {
              setConditions((prev) => ({ ...prev, windTurbineId: val }));
            }}
            defaultValue={conditions?.windTurbineId || assets.items[0].id}
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
    <SearchResultPage {...{ filters: generateFilters(), actions, results: generateTables() }}>
      {visible && (
        <MeasurementEdit
          {...{
            visible,
            onCancel: () => setVisible(false),
            selectedRow,
            onSuccess: (assetId) => {
              if (assetId) {
                fetchAssets({ type: AssetTypes.WindTurbind.id });
                setConditions((prev) => ({ ...prev, windTurbineId: assetId }));
              }
              setVisible(false);
            }
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default MeasurementManagement;
