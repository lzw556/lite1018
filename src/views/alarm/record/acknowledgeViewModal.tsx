import { Form, Input, ModalProps } from 'antd';
import { FC } from 'react';
import dayjs from '../../../utils/dayjsUtils';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../../components/modalWrapper';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';

export interface AcknowledgeViewModalProps extends ModalProps {
  acknowledge: any;
}

const AcknowledgeViewModal: FC<AcknowledgeViewModalProps> = (props) => {
  const { acknowledge } = props;

  return (
    <ModalWrapper {...props} width={420} title={intl.get('ALARM_PROCESSING_DETAIL')} footer={null}>
      <Form {...useLocaleFormLayout()}>
        <Form.Item label={intl.get('ALARM_PROCESSOR')}>
          <Input disabled value={acknowledge.user} />
        </Form.Item>
        <Form.Item label={intl.get('ALARM_NOTE')}>
          <Input.TextArea disabled rows={4} value={acknowledge.note} />
        </Form.Item>
        <Form.Item label={intl.get('ALARM_PROCESSING_TIME')}>
          <Input
            disabled
            value={dayjs.unix(acknowledge.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
          />
        </Form.Item>
      </Form>
    </ModalWrapper>
  );
};

export default AcknowledgeViewModal;
