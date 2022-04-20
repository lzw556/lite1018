import { Form, Input, Modal } from 'antd';
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
  onUpdate: (val: { param: number }) => void;
}) => {
  const [form] = Form.useForm();
  const typeParaMapping = new Map();
  typeParaMapping.set(DeviceType.BoltElongation, 'preload');
  typeParaMapping.set(DeviceType.NormalTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.HighTemperatureCorrosion, 'thickness');
  const property = properties.find((pro) => pro.key === typeParaMapping.get(typeId));

  if (property) {
    return (
      <Modal
        width={420}
        visible={visible}
        title={'校准参数'}
        okText={'校准'}
        onOk={() => {
          form.validateFields().then((values) => {
            onUpdate({...values, param: Number(values.param)});
          });
        }}
        cancelText={'取消'}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} labelCol={{ span: 8 }} validateMessages={defaultValidateMessages}>
          <Form.Item label={`${property.name}`} name='param' rules={[Rules.number]}>
            <Input placeholder={`请输入${property.name}`} suffix={`${property.unit}`}/>
          </Form.Item>
        </Form>
      </Modal>
    );
  } else {
    return <p>参数错误</p>;
  }
};

export default EditCalibrateParas;
