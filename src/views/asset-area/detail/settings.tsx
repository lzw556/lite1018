import React from 'react';
import { Button, Popconfirm, Space, Table, TableProps } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { Flex } from '../../../components';
import { Asset, AssetRow, deleteAsset } from '../../asset-common';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import { ActionBar } from '../actionBar';

type Column = NonNullable<TableProps<AssetRow>['columns']>[0];

export const Settings = (props: {
  asset: AssetRow;
  onSuccess: () => void;
  onUpdate: (asset: AssetRow) => void;
}) => {
  const { asset, onSuccess, onUpdate } = props;
  const { children } = asset;
  const columns: Column[] = [{ title: intl.get('NAME'), dataIndex: 'name' }];
  const operationColumn: Column = {
    title: intl.get('OPERATION'),
    key: 'action',
    render: (row: AssetRow) => (
      <Space>
        <HasPermission value={Permission.AssetEdit}>
          <Button
            type='text'
            size='small'
            title={intl.get('EDIT_SOMETHING', { something: intl.get('ASSET') })}
          >
            <EditOutlined onClick={() => onUpdate(row)} />
          </Button>
        </HasPermission>
        <HasPermission value={Permission.AssetDelete}>
          <Popconfirm
            title={intl.get('DELETE_SOMETHING_PROMPT', { something: row.name })}
            onConfirm={() => {
              deleteAsset(row.id).then(onSuccess);
            }}
          >
            <Button
              type='text'
              danger={true}
              size='small'
              title={intl.get('DELETE_SOMETHING', {
                something: intl.get('ASSET')
              })}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </HasPermission>
      </Space>
    )
  };
  if (children && children.length > 0) {
    const typeOfFirst = children[0].type;
    if (Asset.Assert.isVibrationRelated(typeOfFirst)) {
      columns.push({
        key: 'motor_type',
        render: ({ attributes }: any) => attributes?.motor_type,
        title: intl.get('motor.motor_type')
      });
      columns.push({
        key: 'rotation_speed',
        render: ({ attributes }: any) => attributes?.rotation_speed,
        title: intl.get('motor.rotation_speed')
      });
      columns.push({
        key: 'variable_frequency_drive',
        render: ({ attributes }: any) =>
          !!attributes?.variable_frequency_drive === true ? '是' : '否',
        title: intl.get('motor.variable_frequency_drive')
      });
      columns.push({
        key: 'nominal_power',
        render: ({ attributes }: any) => attributes?.nominal_power,
        title: intl.get('motor.nominal_power')
      });
      columns.push({
        key: 'mounting',
        render: ({ attributes }: any) => (attributes?.mounting === 1 ? '水平' : '垂直'),
        title: intl.get('motor.mounting')
      });
      columns.push({
        key: 'bearing_type',
        render: ({ attributes }: any) => (attributes?.bearing_type === 1 ? '滚动轴承' : '滑动轴承'),
        title: intl.get('motor.bearing_type')
      });
      columns.push({
        key: 'bearing_model',
        render: ({ attributes }: any) => attributes?.bearing_model,
        title: intl.get('motor.bearing_model')
      });
    }
  }
  columns.push(operationColumn);

  return (
    <>
      <Flex style={{ marginBottom: 12 }}>
        <ActionBar {...props} />
      </Flex>
      <Table
        columns={columns}
        dataSource={children?.map((c) => {
          delete c.children;
          return c;
        })}
        pagination={false}
        size='small'
      />
    </>
  );
};
