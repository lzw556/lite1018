import { PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, FormItemProps, Input, InputProps, TableProps } from 'antd';
import * as React from 'react';
import { SearchResult } from '../props';
import { SearchResultPage } from '../searchResultPage';

const AssetManagement: React.FC = () => {
  const [searchResult, setSearchResult] = React.useState<SearchResult>();
  React.useEffect(() => {
    const actions: ButtonProps[] = [
      {
        type: 'primary',
        children: React.Children.toArray(['添加风机', <PlusOutlined />])
      }
    ];
    const filters: FormItemProps<any>[] = [
      {
        label: '名称',
        // name: 'name',
        style: { margin: 0 },
        children: React.Children.toArray([<Input />])
      }
    ];
    type WindTurbine = {
      id: number;
      name: string;
      state: string;
      total: number;
      errorTotal: number;
    };
    const assets: WindTurbine[] = [];
    for (let index = 0; index < 10; index++) {
      assets.push({
        id: index + 1,
        name: `风机${index + 1}`,
        state: '正常',
        total: 40,
        errorTotal: 5
      });
    }
    const table: TableProps<any> = {
      rowKey: 'id',
      columns: [
        { title: '名称', dataIndex: 'name', key: 'name' },
        { title: '状态', dataIndex: 'state', key: 'state' },
        { title: '监测螺栓数量', dataIndex: 'total', key: 'total' },
        { title: '异常螺栓数量', dataIndex: 'errorTotal', key: 'errorTotal' },
        { title: '操作', dataIndex: 'action', key: 'action' }
      ],
      dataSource: assets,
      size: 'small',
      pagination: false
    };
    setSearchResult({ filters, actions, result: table });
  }, []);

  if (searchResult) {
    return <SearchResultPage {...searchResult} />;
  } else {
    return null;
  }
};

export default AssetManagement;
