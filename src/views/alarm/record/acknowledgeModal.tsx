import { Form, Input, Modal, ModalProps } from 'antd';
import { AcknowledgeAlarmRecordRequest } from '../../../apis/alarm';
import { FC, useEffect } from 'react';
import intl from 'react-intl-universal';

export interface AcknowledgeModalProps extends ModalProps {
  record: any;
  onSuccess: () => void;
}

const AcknowledgeModal: FC<AcknowledgeModalProps> = (props) => {
  const [form] = Form.useForm();
  const { record, onSuccess } = props;

  useEffect(() => {
    form.setFieldsValue({
      source: record.source,
      content: `${intl.get(record.metric.name).d(record.metric.name)} ${record.operation} ${
        record.threshold
      }${intl.get(record.metric.unit).d(record.metric.unit)} ${intl.get('ALARM_VALUE')}: ${
        record.value
      }${intl.get(record.metric.unit).d(record.metric.unit)}`
    });
  }, [record]);

  const onSave = () => {
    form.validateFields().then((values) => {
      AcknowledgeAlarmRecordRequest(record.id, values).then((_) => onSuccess());
    });
  };

  return (
    <Modal {...props} width={400} title={intl.get('ALARM_PROCESSING')} onOk={onSave}>
      <Form form={form} labelCol={{ span: 6 }}>
        <Form.Item label={intl.get('ALARM_SOURCE')} name={['source', 'name']}>
          <Input disabled />
        </Form.Item>
        <Form.Item label={intl.get('ALARM_DETAIL')} name={['content']}>
          <Input disabled />
        </Form.Item>
        <Form.Item label={intl.get('ALARM_NOTE')} name={'note'} initialValue={''}>
          <Input.TextArea placeholder={intl.get('PLEASE_ENTER_NOTE')} rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AcknowledgeModal;
