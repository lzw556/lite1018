import { Button, Col, message, Popconfirm, Row, Space, Upload } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import TableLayout from '../layout/TableLayout';
import {
  PagingFirmwaresRequest,
  RemoveFirmwareRequest,
  UploadFirmwareRequest
} from '../../apis/firmware';
import moment from 'moment';
import ShadowCard from '../../components/shadowCard';
import MyBreadcrumb from '../../components/myBreadcrumb';
import HasPermission from '../../permission';
import { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import { Firmware } from '../../types/firmware';
import { isMobile } from '../../utils/deviceDetection';
import { Store, useStore } from '../../hooks/store';

const FirmwarePage = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<PageResult<Firmware[]>>();
  const [store, setStore, gotoPage] = useStore('firmwareList');

  const fetchFirmwares = (store: Store['firmwareList']) => {
    const {
      pagedOptions: { index, size }
    } = store;
    PagingFirmwaresRequest(index, size).then(setDataSource);
  };

  useEffect(() => {
    fetchFirmwares(store);
  }, [store]);

  const onFileChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setIsUploading(true);
    }
  };

  const onUpload = (options: any) => {
    const formData = new FormData();
    formData.append('file', options.file);
    UploadFirmwareRequest(formData).then((res) => {
      setIsUploading(false);
      if (res.code === 200) {
        message.success('固件上传成功').then(() => {
          if (dataSource) {
            const { size, page, total } = dataSource;
            gotoPage({ size, total, index: page }, 'next');
          }
        });
      } else {
        message.error(`上传失败,${res.msg}`).then();
      }
    });
  };

  const onDelete = (id: number) => {
    RemoveFirmwareRequest(id).then((_) => {
      if (dataSource) {
        const { size, page, total } = dataSource;
        gotoPage({ size, total, index: page }, 'prev');
      }
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '软件版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '硬件版本',
      dataIndex: 'productId',
      key: 'productId'
    },
    {
      title: 'CRC',
      dataIndex: 'crc',
      key: 'crc'
    },
    {
      title: '编译时间',
      dataIndex: 'buildTime',
      key: 'buildTime',
      render: (text: number) => moment.unix(text).local().format('yyyy-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => {
        return (
          <Space>
            <Popconfirm
              placement='left'
              title={`确认要删除固件【${record.name}】吗?`}
              onConfirm={() => onDelete(record.id)}
              okText='删除'
              cancelText='取消'
            >
              <Button type='text' size='small' icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <Content>
      <MyBreadcrumb>
        <HasPermission value={Permission.FirmwareAdd}>
          <Upload
            accept={'.bin'}
            name='file'
            customRequest={onUpload}
            showUploadList={false}
            onChange={onFileChange}
          >
            <Button type='primary' loading={isUploading}>
              {isUploading ? '固件上传中' : '上传固件'}
              {isUploading ? null : <UploadOutlined />}
            </Button>
          </Upload>
        </HasPermission>
      </MyBreadcrumb>
      <Row justify='center'>
        <Col span={24}>
          <ShadowCard>
            <TableLayout
              emptyText={'固件列表为空'}
              columns={columns}
              permissions={[Permission.FirmwareDelete]}
              dataSource={dataSource}
              onPageChange={(index, size) =>
                setStore((prev) => ({ ...prev, pagedOptions: { index, size } }))
              }
              simple={isMobile}
              scroll={isMobile ? { x: 900 } : undefined}
            />
          </ShadowCard>
        </Col>
      </Row>
    </Content>
  );
};

export default FirmwarePage;
