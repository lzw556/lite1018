import { Form, Input, ModalProps } from 'antd';
import { AcknowledgeAlarmRecordRequest } from '../../../apis/alarm';
import { FC, useEffect } from 'react';
import intl from 'react-intl-universal';
import { getAlarmDetail } from '../alarm-group';
import { ModalWrapper } from '../../../components/modalWrapper';

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
      content: getAlarmDetail(record, record.metric)
    });
  }, [record, form]);

  const onSave = () => {
    form.validateFields().then((values) => {
      AcknowledgeAlarmRecordRequest(record.id, values).then((_) => onSuccess());
    });
  };

  return (
    <ModalWrapper {...props} width={400} title={intl.get('ALARM_PROCESSING')} onOk={onSave}>
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
    </ModalWrapper>
  );
};

export default AcknowledgeModal;
