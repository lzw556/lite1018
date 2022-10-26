import { Form, Modal, ModalProps, Select, Typography, Divider, Checkbox } from 'antd';
import { AlarmRule } from '../../../../types/alarm_rule_template';
import { FC, useEffect, useState } from 'react';
import { defaultValidateMessages } from '../../../../constants/validator';
import { GetDevicesRequest } from '../../../../apis/device';
import '../../../../string-extension';
import { AddAlarmRuleSourceRequest } from '../../../../apis/alarm';
import { GetNetworksRequest } from '../../../../apis/network';

const { Option } = Select;

export interface AddSourceModalProps extends ModalProps {
  value: AlarmRule;
  onSuccess?: () => void;
}

const AddSourceModal: FC<AddSourceModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, value, onSuccess } = props;
  const [sources, setSources] = useState<any>([]);
  const [networks, setNetworks] = useState<any>([]);
  const [network, setNetwork] = useState<any>();
  const [isLoading, setIsLoading] = useState<any>(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      const ids = value.sources.map((source) => source.id);
      const filters: any = {
        type: value.sourceType
      };
      if (network) {
        filters.network_id = network.id;
      }
      GetDevicesRequest(filters).then((data) => {
        setSources(data.filter((item) => !ids.includes(item.id)));
      });
    }
  }, [visible, network]);

  const onAdd = () => {
    setIsLoading(true);
    form.validateFields().then((values) => {
      AddAlarmRuleSourceRequest(value.id, values).then((_) => {
        setIsLoading(false);
        form.resetFields();
        onSuccess && onSuccess();
      });
    });
  };

  const onFilter = (open: any) => {
    if (open) {
      GetNetworksRequest().then((data) => {
        setNetworks(data);
      });
    }
  };

  return (
    <Modal {...props} width={400} title={'添加监控对象'} onOk={onAdd} confirmLoading={isLoading}>
      <Form form={form} labelCol={{ span: 6 }} validateMessages={defaultValidateMessages}>
        {value.category === 1 && (
          <Form.Item label={'请选择网络'}>
            <Select
              placeholder={'请选择网络'}
              onDropdownVisibleChange={onFilter}
              onChange={(value) => {
                setNetwork(networks.find((item: any) => item.id === value));
              }}
            >
              {networks.map((item: any) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item label={'监控对象'} name={'ids'}>
          <Select
            placeholder={'请选择监控对象'}
            mode={'multiple'}
            maxTagCount={4}
            dropdownRender={(menu) => {
              return (
                <div>
                  {menu}
                  <Divider style={{ margin: '2px 0' }} />
                  <div style={{ padding: '4px 8px 8px 8px', cursor: 'pointer' }}>
                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked) {
                          form.setFieldsValue({ ids: sources.map((item: any) => item.id) });
                        } else {
                          form.resetFields(['ids']);
                        }
                      }}
                    >
                      全选
                    </Checkbox>
                  </div>
                </div>
              );
            }}
          >
            {sources.map((source: any) => (
              <Option key={source.id} value={source.id}>
                <Typography.Text strong>{source.name}</Typography.Text>
                <br />
                <Typography.Text type={'secondary'}>
                  {source.macAddress.macSeparator().toUpperCase()}
                </Typography.Text>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSourceModal;
