import { DatePicker, Form, Modal, ModalProps, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import { DownloadDeviceDataRequest } from '../../../../../apis/device';
import moment from 'moment';
import { Device } from '../../../../../types/device';
import intl from 'react-intl-universal';

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface DownloadModalProps extends ModalProps {
  device: Device;
  property?: any;
  onSuccess: () => void;
}

const DownloadModal: FC<DownloadModalProps> = (props) => {
  const { visible, device, property, onSuccess } = props;
  const [startDate, setStartDate] = useState<moment.Moment>(
    moment().startOf('day').subtract(7, 'd')
  );
  const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'));
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        properties: property ? [property.key] : []
      });
    }
  }, [visible]);

  const onDownload = () => {
    form.validateFields(['properties']).then((values) => {
      DownloadDeviceDataRequest(device.id, startDate.utc().unix(), endDate.utc().unix(), {
        pids: JSON.stringify(values.properties)
      }).then((res) => {
        if (res.status === 200) {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${device.name}.xlsx`);
          document.body.appendChild(link);
          link.click();
          onSuccess();
        }
      });
    });
  };

  return (
    <Modal
      {...props}
      width={430}
      title={intl.get('DOWNLOAD_DATA')}
      okText={intl.get('DOWNLOAD')}
      onOk={onDownload}
      cancelText={intl.get('CANCEL')}
    >
      <Form form={form} labelCol={{ span: 8 }}>
        <Form.Item label={intl.get('PROPERTY')} name={'properties'} required>
          <Select
            placeholder={intl.get('PLEASE_SELECT_DEVICE_PROPERTY')}
            mode={'multiple'}
            maxTagCount={2}
          >
            {device.properties.map((item) => (
              <Option key={item.key} value={item.key}>
                {intl.get(item.name)}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={intl.get('DATE_RANGE')} required>
          <RangePicker
            allowClear={false}
            style={{ width: '252px' }}
            value={[startDate, endDate]}
            onChange={(_, dateString) => {
              if (dateString) {
                setStartDate(moment(dateString[0]).startOf('day'));
                setEndDate(moment(dateString[1]).endOf('day'));
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DownloadModal;
