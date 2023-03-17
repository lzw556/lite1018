import { Form, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import { RangeDatePicker } from '../../../components/rangeDatePicker';
import { defaultValidateMessages } from '../../../constants/validator';
import { getFilename } from '../../../utils/format';
import { MonitoringPointRow, getSpecificProperties } from '../../monitoring-point';
import { downloadHistory } from '..';

const { Option } = Select;

export interface DownloadModalProps extends ModalProps {
  measurement: MonitoringPointRow;
  property?: any;
  onSuccess: () => void;
  assetId?: number;
  isFlangeProload?: boolean;
}

export const DownloadHistory: React.FC<DownloadModalProps> = (props) => {
  const { open, measurement, property, onSuccess, assetId } = props;
  const [range, setRange] = React.useState<[number, number]>();
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        properties: property ? [property.key] : []
      });
    }
  }, [open, form, property]);

  const onDownload = () => {
    form.validateFields().then((values) => {
      if (range) {
        const [from, to] = range;
        downloadHistory(measurement.id, from, to, JSON.stringify(values.properties), assetId).then(
          (res) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', getFilename(res));
            document.body.appendChild(link);
            link.click();
            onSuccess();
          }
        );
      }
    });
  };

  return (
    <Modal
      {...props}
      width={390}
      title={'数据下载'}
      okText={'下载'}
      onOk={onDownload}
      cancelText={'取消'}
    >
      <Form form={form} labelCol={{ span: 6 }} validateMessages={defaultValidateMessages}>
        <Form.Item
          label={'属性'}
          name={'properties'}
          rules={[{ required: true, message: '请选择属性' }]}
        >
          <Select placeholder={'请选择属性'} mode={'multiple'} maxTagCount={2}>
            {getSpecificProperties(measurement.properties, measurement.type)
              .filter((pro) => {
                if (props.isFlangeProload) {
                  return pro.key === 'preload' || pro.key === 'pressure';
                } else {
                  return () => true;
                }
              })
              .map((item) => (
                <Option key={item.key} value={item.key}>
                  {item.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item label={'时间范围'} required>
          <RangeDatePicker
            onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
