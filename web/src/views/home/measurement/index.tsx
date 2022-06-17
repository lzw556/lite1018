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
  TableProps,
  Tag
} from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssetTypes, MeasurementTypes } from '../common/constants';
import { AssetRow } from '../asset/props';
import { getAssets } from '../asset/services';
import { MeasurementEdit } from './edit';
import { MeasurementRow } from './props';
import { deleteMeasurement } from './services';
import { combineFinalUrl } from '../common/utils';
import Label from '../../../components/label';
import { SearchResultPage } from '../components/searchResultPage';
import { generatePropertyColumns } from '../common/historyDataHelper';
import {
  convertAlarmLevelToState,
  getAlarmStateText,
  getAlarmLevelColor
} from '../common/statisticsHelper';

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
  const actions: ButtonProps[] = [
    {
      type: 'primary',
      children: React.Children.toArray(['添加监测点', <PlusOutlined />]),
      onClick: () => open()
    }
  ];

  const generateTable = (title: string, dataSource: TableProps<any>['dataSource']) => {
    return (
      <>
        <p style={{ marginBottom: 8, marginTop: 8, fontSize: 16 }}>{title}</p>
        <Table
          {...{
            rowKey: 'id',
            columns: [
              {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                // width: 300,
                render: (name: string, row: MeasurementRow) => (
                  <Link
                    to={combineFinalUrl(pathname, search, MeasurementTypes.preload.url, row.id)}
                  >
                    {name}
                  </Link>
                )
              },
              {
                title: '状态',
                dataIndex: 'alertLevel',
                key: 'alertLevel',
                width: 120,
                render: (level: number) => {
                  const alarmState = convertAlarmLevelToState(level);
                  return (
                    <Tag
                      style={{
                        border: `solid 1px ${getAlarmLevelColor(alarmState)}`,
                        color: getAlarmLevelColor(alarmState)
                      }}
                    >
                      {getAlarmStateText(alarmState)}
                    </Tag>
                  );
                }
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
      </>
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
    if (assets.items.length > 0 && !filters) {
      setFilters((prev) => ({ ...prev, windTurbineId: assets.items[0].id }));
    }
    if (filters) {
      localStorage.setItem('measurementListFilters', JSON.stringify(filters));
      setWind(assets.items.find((asset) => asset.id === filters.windTurbineId));
    }
  }, [filters, assets]);

  const generateTables = () => {
    if (!wind) return [];
    if (
      !wind.children ||
      wind.children.length === 0 ||
      (wind.children.length > 0 && wind.children.every(({ monitoringPoints }) => !monitoringPoints))
    )
      return [<Empty description='没有法兰或监测点' image={Empty.PRESENTED_IMAGE_SIMPLE} />];
    return wind.children
      .sort((prev, next) => {
        const { type: prevType } = prev.attributes || { index: 5, type: 4 };
        const { type: nextType } = next.attributes || { index: 5, type: 4 };
        return prevType - nextType;
      })
      .filter(({ monitoringPoints }) => monitoringPoints && monitoringPoints.length > 0)
      .map(({ name, monitoringPoints }) =>
        generateTable(
          name,
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
              setFilters((prev) => ({ ...prev, windTurbineId: val }));
            }}
            defaultValue={filters?.windTurbineId || assets.items[0].id}
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
