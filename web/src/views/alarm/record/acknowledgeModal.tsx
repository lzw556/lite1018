import {Form, Input, Modal, ModalProps} from "antd";
import {AcknowledgeAlarmRecordRequest} from "../../../apis/alarm";
import {FC, useEffect} from "react";

export interface AcknowledgeModalProps extends ModalProps {
    record: any
    onSuccess: () => void
}

const AcknowledgeModal: FC<AcknowledgeModalProps> = (props) => {
    const [form] = Form.useForm();
    const {record, onSuccess} = props;

    useEffect(() => {
        form.setFieldsValue({
            name: record.name,
            field: record.field.title,
        });
    }, [record]);


    const onSave = () => {
        form.validateFields().then(values => {
            AcknowledgeAlarmRecordRequest(record.id, values).then(_ => onSuccess());
        });
    }

    return <Modal {...props} width={420} title={"报警处理"} onOk={onSave}>
        <Form form={form}>
            <Form.Item label={"报警名称"} name={"name"}>
                <Input disabled/>
            </Form.Item>
            <Form.Item label={"报警属性"} name={"field"}>
                <Input disabled/>
            </Form.Item>
            <Form.Item label={"处理意见"} name={"note"}>
                <Input.TextArea placeholder={"请输入处理意见"} rows={4}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default AcknowledgeModal;