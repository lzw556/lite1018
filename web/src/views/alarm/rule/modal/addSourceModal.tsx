import {Form, Modal, ModalProps, Select, Typography} from "antd";
import {AlarmRule} from "../../../../types/alarm_rule_template";
import {FC, useEffect, useState} from "react";
import {defaultValidateMessages} from "../../../../constants/validator";
import {GetDevicesRequest} from "../../../../apis/device";
import "../../../../string-extension";
import {AddAlarmRuleSourceRequest} from "../../../../apis/alarm";

const {Option} = Select;

export interface AddSourceModalProps extends ModalProps {
    value: AlarmRule;
    onSuccess?: () => void;
}

const AddSourceModal:FC<AddSourceModalProps> = (props) => {
    const [form] = Form.useForm();
    const {visible, value, onSuccess} = props;
    const [sources, setSources] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<any>(false);

    useEffect(() => {
        if (visible) {
            form.resetFields();
            const ids = value.sources.map((source) => source.id);
            GetDevicesRequest({type: value.sourceType.split("::")[1]}).then(data => {
                setSources(data.filter((item) => !ids.includes(item.id)))
            })
        }
    }, [visible]);

    const onAdd = () => {
        setIsLoading(true);
        form.validateFields().then(values => {
            AddAlarmRuleSourceRequest(value.id, values).then(_ => {
                setIsLoading(false);
                form.resetFields();
                onSuccess && onSuccess();
            })
        })
    }

    return <Modal {...props} title={"添加监控对象"} onOk={onAdd} confirmLoading={isLoading}>
        <Form form={form} validateMessages={defaultValidateMessages}>
            <Form.Item label={"监控对象"} name={"ids"}>
                <Select placeholder={"请选择监控对象"} mode={"multiple"} maxTagCount={4}>
                    {sources.map((source:any) =>
                        <Option key={source.id} value={source.id}>
                            <Typography.Text strong>{source.name}</Typography.Text><br/>
                            <Typography.Text type={"secondary"}>{source.macAddress.macSeparator().toUpperCase()}</Typography.Text>
                        </Option>)}
                </Select>
            </Form.Item>
        </Form>
    </Modal>
}

export default AddSourceModal;