import { DatePicker, Form, Modal, ModalProps, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import moment from 'moment';
import { MeasurementRow } from '../props';
import { downloadHistory } from '../services';
import { defaultValidateMessages } from '../../../../constants/validator';
import { getFilename } from '../../common/utils';

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface DownloadModalProps extends ModalProps {
  measurement: MeasurementRow;
  property?: any;
  onSuccess: () => void;
}

export const HistoryDataDownload: FC<DownloadModalProps> = (props) => {
  const { visible, measurement, property, onSuccess } = props;
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
  }, [visible, form, property]);

  const onDownload = () => {
    form.validateFields().then((values) => {
      console.log(values)
      downloadHistory(measurement.id, startDate.utc().unix(), endDate.utc().unix(), JSON.stringify(values.properties)).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', getFilename(res));
        document.body.appendChild(link);
        link.click();
        onSuccess();
      });
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
      <Form form={form} labelCol={{span:6}} validateMessages={defaultValidateMessages}>
        <Form.Item label={'属性'} name={'properties'} rules={[{required:true, message:'请选择属性'}]}>
          <Select placeholder={'请选择属性'} mode={'multiple'} maxTagCount={2}>
            {measurement.properties.map((item) => (
              <Option key={item.key} value={item.key}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'时间范围'} required>
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
