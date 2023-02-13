import { Col, ConfigProvider, Empty, Pagination, PaginationProps, Row, Table } from 'antd';
import { FC } from 'react';
import zhCN from 'antd/es/locale/zh_CN';
import usePermission, { PermissionType } from '../../permission/permission';
import { PageResult } from '../../types/page';

export interface TableLayoutProps {
  columns: any;
  rowSelection?: any;
  dataSource: PageResult<any> | any;
  expandable?: any;
  emptyText?: string | any;
  permissions?: PermissionType[];
  onPageChange?: (page: number, pageSize: number) => void;
  scroll?: { x: number };
  simple?: boolean;
  onChange?: (pagination: any, filters: any) => void;
}

const TableLayout: FC<TableLayoutProps> = (props) => {
  const {
    columns,
    permissions,
    rowSelection,
    dataSource,
    emptyText,
    onPageChange,
    expandable,
    scroll,
    simple,
    onChange
  } = props;
  const pagination: PaginationProps = {
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
    onChange: onPageChange
  };
  const { hasPermission } = usePermission();

  const renderEmpty = () => {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
  };

  const renderColumns = () => {
    if (
      permissions &&
      permissions.every((permission: PermissionType) => !hasPermission(permission))
    ) {
      return columns?.filter((item: any) => item.key !== 'action');
    }
    return columns;
  };

  const renderDataSource = () => {
    if (dataSource) {
      if (Array.isArray(dataSource)) {
        return dataSource;
      } else {
        return dataSource.result;
      }
    }
  };

  return (
    <ConfigProvider renderEmpty={renderEmpty} locale={zhCN}>
      <Row justify='center'>
        <Col span={24}>
          <Table
            rowKey={(record: any) => record.id}
            size={'small'}
            columns={renderColumns()}
            rowSelection={rowSelection}
            dataSource={renderDataSource()}
            expandable={expandable}
            pagination={false}
            scroll={scroll}
            onChange={onChange}
          />
        </Col>
      </Row>
      <br />
      <Row justify={'end'} style={{ textAlign: 'right' }}>
        <Col span={24}>
          {dataSource && !Array.isArray(dataSource) && (
            <Pagination
              {...pagination}
              current={dataSource.page}
              total={dataSource.total}
              pageSize={dataSource.size}
              simple={simple}
            />
          )}
        </Col>
      </Row>
    </ConfigProvider>
  );
};

export default TableLayout;
