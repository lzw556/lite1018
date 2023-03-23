import { Button, Form, Input, Modal, Select } from 'antd';
import { defaultValidateMessages } from '../../../constants/validator';
import { DeviceType } from '../../../types/device_type';
import { Property } from '../../../types/property';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

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
  typeParaMapping.set(DeviceType.BoltElongation4Channels, 'preload');
  typeParaMapping.set(DeviceType.BoltElongation8Channels, 'preload');
  typeParaMapping.set(DeviceType.NormalTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.HighTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.PressureTemperature, 'pressure');
  const property = properties.find((pro) => pro.key === typeParaMapping.get(typeId));
  const isSPT = typeId === DeviceType.PressureTemperature;
  const channels = DeviceType.isMultiChannel(typeId, true);

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
        title={intl.get('CALIBRATION_PARAMETERS')}
        footer={[
          <Button key='cancel' onClick={() => setVisible(false)}>
            {intl.get('CANCEL')}
          </Button>,
          isSPT && (
            <Button key='submit_0' onClick={() => handleSubmit(0)}>
              {intl.get('ZERO_CALIBRATE')}
            </Button>
          ),
          <Button
            key='submit'
            type='primary'
            onClick={() => {
              handleSubmit();
            }}
          >
            {isSPT ? intl.get('LINEAR_CALIBRATE') : intl.get('CALIBRATE')}
          </Button>
        ]}
      >
        <Form form={form} labelCol={{ span: 8 }} validateMessages={defaultValidateMessages}>
          <FormInputItem
            label={`${intl.get(property.name).d(property.name)}`}
            name='param'
            requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get(property.name).d(property.name)
            })}
            numericRule={{ isInteger: false }}
          >
            <Input
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get(property.name).d(property.name)
              })}
              suffix={`${property.unit}`}
            />
          </FormInputItem>
          {channels.length > 0 && (
            <Form.Item
              label={intl.get('CHANNEL')}
              name='channel'
              rules={[{ required: true, message: intl.get('PLEASE_SELECT_CHANNEL') }]}
              initialValue={1}
            >
              <Select>
                {channels.map(({ label, value }) => (
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
    return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;
  }
};

export default EditCalibrateParas;
