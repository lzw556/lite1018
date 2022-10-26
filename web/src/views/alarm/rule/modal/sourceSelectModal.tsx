import {
  Cascader,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Modal,
  ModalProps,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import { FC, useEffect, useState } from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { DeviceType } from '../../../../types/device_type';
import { GetPropertiesRequest } from '../../../../apis/property';
import { PagingDevicesRequest } from '../../../../apis/device';
import { Device } from '../../../../types/device';
import { PageResult } from '../../../../types/page';
import '../../../../string-extension';
import { ColorHealth, ColorWarn } from '../../../../constants/color';
import zhCN from 'antd/es/locale/zh_CN';

const { TabPane } = Tabs;

export interface SourceSelectModalProps extends ModalProps {
  deviceType: number;
  onSuccess?: (value: any) => void;
}

const SourceSelectModal: FC<SourceSelectModalProps> = (props) => {
  const { visible, deviceType, onSuccess } = props;
  const [dataSource, setDataSource] = useState<PageResult<Device[]>>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState<any>({ current: 1, size: 8 });
  const [category, setCategory] = useState<any>('1');
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedRowKeys([]);
    }
  }, [visible]);

  useEffect(() => {
    if (deviceType) {
      PagingDevicesRequest(pagination.current, pagination.size, { type: deviceType }).then(
        setDataSource
      );
    }
  }, [pagination, deviceType]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: any) => {
      setSelectedRowKeys([...selectedKeys]);
    }
  };

  const onOk = () => {
    if (onSuccess) {
      form.validateFields().then((values) => {
        const selected = dataSource?.result
          .filter((item: Device) => selectedRowKeys.includes(item.macAddress))
          .map((item) => {
            return {
              id: item.id,
              name: item.name
            };
          });
        onSuccess({ sources: selected });
      });
    }
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: '12%',
      render: (state: any) => {
        return (
          <Space>
            {state && state.isOnline ? (
              <Tag color={ColorHealth}>在线</Tag>
            ) : (
              <Tag color={ColorWarn}>离线</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'MAC地址',
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (text: string) => text.toUpperCase().macSeparator()
    }
  ];

  return (
    <Modal {...props} title={'选择监控对象'} width={600} onOk={onOk}>
      <ConfigProvider
        renderEmpty={() => (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'资源列表为空'} />
        )}
        locale={zhCN}
      >
        <Table
          rowKey={(record) => record.macAddress}
          rowSelection={rowSelection}
          scroll={{ y: 256 }}
          columns={columns}
          dataSource={dataSource?.result}
          pagination={false}
          size={'small'}
        />
        <br />
        <Row justify={'space-between'}>
          <Col span={12}>
            <Typography.Text>已选中{selectedRowKeys.length}个资源</Typography.Text>
          </Col>
          <Col span={12}>
            <Row justify={'end'}>
              <Col>
                {dataSource?.total && (
                  <Pagination
                    size='small'
                    total={dataSource?.total}
                    showSizeChanger
                    current={pagination.current}
                    pageSize={pagination.size}
                    onChange={(page, pageSize) => {
                      setPagination({ current: page, size: pageSize });
                    }}
                  />
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </ConfigProvider>
    </Modal>
  );
};

export default SourceSelectModal;
