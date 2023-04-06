import { Form, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import { RangeDatePicker } from '../../../components/rangeDatePicker';
import { getFilename } from '../../../utils/format';
import { MonitoringPointRow, getSpecificProperties } from '../../monitoring-point';
import { downloadHistory } from '..';
import { useLocaleContext } from '../../../localeProvider';
import intl from 'react-intl-universal';

const { Option } = Select;

export interface DownloadModalProps extends ModalProps {
  measurement: MonitoringPointRow;
  property?: any;
  onSuccess: () => void;
  assetId?: number;
  virtualPoint?: MonitoringPointRow | undefined;
}

export const DownloadHistory: React.FC<DownloadModalProps> = (props) => {
  const { open, measurement, property, onSuccess, assetId } = props;
  const [range, setRange] = React.useState<[number, number]>();
  const [form] = Form.useForm();
  const { language } = useLocaleContext();

  const properties = props.virtualPoint
    ? props.virtualPoint.properties.filter((pro) => pro.key === 'preload' || pro.key === 'pressure')
    : getSpecificProperties(measurement.properties, measurement.type);

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
        downloadHistory(
          measurement.id,
          from,
          to,
          JSON.stringify(values.properties),
          language === 'en-US' ? 'en' : 'zh',
          assetId
        ).then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', getFilename(res));
          document.body.appendChild(link);
          link.click();
          onSuccess();
        });
      }
    });
  };

  return (
    <Modal
      {...props}
      width={430}
      title={intl.get('DWONLOAD_DATA')}
      okText={intl.get('DOWNLOAD')}
      onOk={onDownload}
      cancelText={intl.get('CANCEL')}
    >
      <Form form={form} labelCol={{ span: 8 }}>
        <Form.Item
          label={intl.get('PROPERTY')}
          name={'properties'}
          rules={[{ required: true, message: intl.get('PLEASE_SELECT_PEROPRY') }]}
        >
          <Select
            placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
            mode={'multiple'}
            maxTagCount={2}
          >
            {properties.map((item) => (
              <Option key={item.key} value={item.key}>
                {intl.get(item.name).d(item.name)}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={intl.get('DATE_RANGE')} required>
          <RangeDatePicker
            onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
