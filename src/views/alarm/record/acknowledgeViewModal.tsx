import { Form, Input, Modal, ModalProps } from 'antd';
import { FC } from 'react';
import dayjs from '../../../utils/dayjsUtils';
import intl from 'react-intl-universal';

export interface AcknowledgeViewModalProps extends ModalProps {
  acknowledge: any;
}

const AcknowledgeViewModal: FC<AcknowledgeViewModalProps> = (props) => {
  const { acknowledge } = props;

  return (
    <Modal {...props} width={420} title={intl.get('ALARM_PROCESSING_DETAIL')} footer={null}>
      <Form.Item label={intl.get('ALARM_PROCESSOR')} labelCol={{ span: 5 }}>
        <Input disabled value={acknowledge.user} />
      </Form.Item>
      <Form.Item label={intl.get('ALARM_NOTE')} labelCol={{ span: 5 }}>
        <Input.TextArea disabled rows={4} value={acknowledge.note} />
      </Form.Item>
      <Form.Item label={intl.get('ALARM_PROCESSING_TIME')} labelCol={{ span: 5 }}>
        <Input
          disabled
          value={dayjs.unix(acknowledge.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
        />
      </Form.Item>
    </Modal>
  );
};

export default AcknowledgeViewModal;
