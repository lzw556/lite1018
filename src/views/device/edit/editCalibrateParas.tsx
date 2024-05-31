import { Button, Form, InputNumber, Select } from 'antd';
import { DeviceType } from '../../../types/device_type';
import { Property } from '../../../types/property';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { ModalWrapper } from '../../../components/modalWrapper';

type Paras = { param: number; channel?: number; sub_command?: number };

const EditCalibrateParas = ({
  typeId,
  properties,
  open,
  setVisible,
  onUpdate
}: {
  typeId: number;
  properties: Property[];
  open: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate: (val: Paras) => void;
}) => {
  const [form] = Form.useForm();
  const typeParaMapping = new Map();
  typeParaMapping.set(DeviceType.BoltElongation, 'preload');
  typeParaMapping.set(DeviceType.BoltElongation4Channels, 'preload');
  typeParaMapping.set(DeviceType.BoltElongation8Channels, 'preload');
  typeParaMapping.set(DeviceType.NormalTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.HighTemperatureCorrosion, 'thickness');
  typeParaMapping.set(DeviceType.DC110H, 'thickness');
  typeParaMapping.set(DeviceType.Pressure, 'pressure');
  typeParaMapping.set(DeviceType.PressureGuoDa, 'pressure');
  typeParaMapping.set(DeviceType.PressureWoErKe, 'pressure');
  typeParaMapping.set(DeviceType.PressureTemperature, 'pressure');
  typeParaMapping.set(DeviceType.PressureTemperatureWIRED, 'pressure');
  const isVibration = DeviceType.isVibration(typeId);
  const isSVT220S1 = DeviceType.SVT220S1 === typeId;
  const property = properties.find(
    (pro) => pro.key === (isVibration ? 'acceleration_peak' : typeParaMapping.get(typeId))
  );
  const isSPT = DeviceType.isSPT(typeId);
  const channels = DeviceType.isMultiChannel(typeId, true);
  const AXIS = [
    { label: 'AXIS_X', value: 1 },
    { label: 'AXIS_Y', value: 2 },
    { label: 'AXIS_Z', value: 3 }
  ];

  function handleSubmit(param?: number) {
    if (param !== undefined) {
      onUpdate({ param });
    } else {
      form.validateFields().then((values) => {
        let paras: Paras = { param: Number(values.param) };
        if (values.channel) {
          paras = { ...paras, channel: Number(values.channel) };
        }
        if (values.sub_command || isVibration) {
          paras = { ...paras, sub_command: isSVT220S1 ? 3 : Number(values.sub_command) };
        }
        onUpdate(paras);
      });
    }
  }

  if (property) {
    return (
      <ModalWrapper
        width={420}
        open={open}
        title={intl.get('CALIBRATION_PARAMETERS')}
        onCancel={() => setVisible(false)}
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
        <Form form={form} labelCol={{ span: 8 }}>
          <FormInputItem
            label={`${intl.get(property.name).d(property.name)}`}
            name='param'
            requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get(property.name).d(property.name)
            })}
            numericRule={{ isInteger: false }}
            numericChildren={
              <InputNumber
                controls={false}
                style={{ width: '100%' }}
                placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get(property.name).d(property.name)
                })}
                addonAfter={property.unit}
              />
            }
          />
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
          {isVibration && !isSVT220S1 && (
            <Form.Item
              label={intl.get('AXIS')}
              name='sub_command'
              rules={[{ required: true, message: intl.get('PLEASE_SELECT_CHANNEL') }]}
              initialValue={1}
            >
              <Select>
                {AXIS.map(({ label, value }) => (
                  <Select.Option key={value} value={value}>
                    {intl.get(label)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </ModalWrapper>
    );
  } else {
    return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;
  }
};

export default EditCalibrateParas;
