import {Form, Input, Modal, ModalProps} from "antd";
import {FC} from "react";
import moment from "moment";

export interface AcknowledgeViewModalProps extends ModalProps {
    acknowledge: any
}

const AcknowledgeViewModal: FC<AcknowledgeViewModalProps> = (props) => {
    const {acknowledge} = props;

    return <Modal {...props} width={420} title={"报警处理详情"}>
        <Form.Item label={"处理人"} labelCol={{span: 5}}>
            <Input disabled value={acknowledge.user}/>
        </Form.Item>
        <Form.Item label={"处理意见"} labelCol={{span: 5}}>
            <Input.TextArea disabled rows={4} value={acknowledge.note}/>
        </Form.Item>
        <Form.Item label={"处理时间"} labelCol={{span: 5}}>
            <Input disabled value={moment.unix(acknowledge.timestamp).local().format("YYYY-MM-DD hh:mm:ss")}/>
        </Form.Item>
    </Modal>
}

export default AcknowledgeViewModal;