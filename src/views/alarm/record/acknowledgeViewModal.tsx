import { Form, Input, Modal, ModalProps } from 'antd';
import { FC } from 'react';
import dayjs from '../../../utils/dayjsUtils';

export interface AcknowledgeViewModalProps extends ModalProps {
  acknowledge: any;
}

const AcknowledgeViewModal: FC<AcknowledgeViewModalProps> = (props) => {
  const { acknowledge } = props;

  return (
    <Modal {...props} width={420} title={'报警处理详情'} footer={null}>
      <Form.Item label={'处理人'} labelCol={{ span: 5 }}>
        <Input disabled value={acknowledge.user} />
      </Form.Item>
      <Form.Item label={'处理意见'} labelCol={{ span: 5 }}>
        <Input.TextArea disabled rows={4} value={acknowledge.note} />
      </Form.Item>
      <Form.Item label={'处理时间'} labelCol={{ span: 5 }}>
        <Input
          disabled
          value={dayjs.unix(acknowledge.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
        />
      </Form.Item>
    </Modal>
  );
};

export default AcknowledgeViewModal;
