import { Button, Form, Input, Modal, Select } from 'antd';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { DeviceType } from '../../../types/device_type';
import { Property } from '../../../types/property';

const EditCalibrateParas = ({
  typeId,
  properties,
  visible,
  setVisible,
  onUpdate
}: {
  typeId: number;
  properties: Property[];
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate: (val: { param: number; channel?: number }) => void;
}) => {
  const [form] = Form.useForm();
  const typeParaMapping = new Map();
  typeParaMapping.set(DeviceType.BoltElongation, 'preload');
  typeParaMapping.set(DeviceType.BoltElongationMultiChannels, 'preload');
  typeParaMapping.set(DeviceType.NormalTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.HighTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.PressureTemperature, 'pressure');
  const property = properties.find((pro) => pro.key === typeParaMapping.get(typeId));
  const isSPT = typeId === DeviceType.PressureTemperature;

  function handleSubmit(param?: number) {
    if (param !== undefined) {
      onUpdate({ param });
    } else {
      form.validateFields().then((values) => {
        onUpdate({ param: Number(values.param), channel: Number(values.channel) });
      });
    }
  }

  if (property) {
    return (
      <Modal
        width={420}
        visible={visible}
        title={'校准参数'}
        footer={[
          <Button key='cancel' onClick={() => setVisible(false)}>
            取消
          </Button>,
          isSPT && (
            <Button key='submit_0' onClick={() => handleSubmit(0)}>
              零点校准
            </Button>
          ),
          <Button
            key='submit'
            type='primary'
            onClick={() => {
              handleSubmit();
            }}
          >
            {isSPT ? `线性校准` : '校准'}
          </Button>
        ]}
      >
        <Form form={form} labelCol={{ span: 8 }} validateMessages={defaultValidateMessages}>
          <Form.Item label={`${property.name}`} name='param' rules={[Rules.number]}>
            <Input placeholder={`请输入${property.name}`} suffix={`${property.unit}`} />
          </Form.Item>
          {typeId === DeviceType.BoltElongationMultiChannels && (
            <Form.Item
              label='通道号'
              name='channel'
              rules={[{ required: true, message: `请选择通道号` }]}
              initialValue={1}
            >
              <Select>
                {[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 }
                ].map(({ label, value }) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  } else {
    return <p>参数错误</p>;
  }
};

export default EditCalibrateParas;
