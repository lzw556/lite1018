import { Form, Input, Modal, ModalProps, Radio } from 'antd';
import * as React from 'react';
import * as AppConfig from '../../../config';
import { defaultValidateMessages } from '../../../constants/validator';
import { EditFormPayload } from '../common/useActionBarStatus';
import { EditContent } from '../measurementList/editContent';
import { Measurement } from '../summary/measurement/props';
import { addMeasurements } from '../summary/measurement/services';
import { Asset } from './props';
import { addAsset } from './services';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

export const ChildAddition: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const [formAsset] = Form.useForm<Asset>();
  const [formPoint] = Form.useForm<Measurement & { device_id: number }>();

  const [type, setType] = React.useState('asset');

  const topAsset = AppConfig.use('default').assetType;

  return (
    <Modal
      {...{
        title: `${
          type === 'asset' ? intl.get('CREATE_ASSET') : intl.get('CREATE_MONITORING_POINT')
        }`,
        cancelText: intl.get('CANCEL'),
        okText: intl.get('CREATE'),
        ...props,
        onOk: () => {
          if (type === 'asset') {
            formAsset.validateFields().then((values) => {
              try {
                addAsset({ ...values, parent_id: asset?.id || 0 }).then(() => {
                  onSuccess();
                });
              } catch (error) {
                console.log(error);
              }
            });
          } else if (type === 'point') {
            formPoint.validateFields().then((values) => {
              try {
                addMeasurements({
                  monitoring_points: [
                    {
                      asset_id: values.asset_id,
                      name: values.name,
                      type: values.type,
                      attributes: values.attributes,
                      device_binding: values.channel
                        ? {
                            device_id: values.device_id,
                            process_id: 2,
                            parameters: { channel: values.channel }
                          }
                        : { device_id: values.device_id }
                    }
                  ]
                }).then(() => {
                  onSuccess();
                });
              } catch (error) {
                console.log(error);
              }
            });
          }
        }
      }}
    >
      <Radio.Group
        style={{ marginBottom: 24 }}
        options={[
          { label: intl.get('ASSET'), value: 'asset' },
          { label: intl.get('MONITORING_POINT'), value: 'point' }
        ]}
        onChange={(e) => setType(e.target.value)}
        value={type}
        optionType='button'
        buttonStyle='solid'
      />
      {type === 'asset' && (
        <Form form={formAsset} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
          <FormInputItem
            label={intl.get('NAME')}
            name='name'
            requiredMessage={intl.get('PLEASE_INPUT_OBJECT_NAME', {
              object: intl.get(topAsset.label)
            })}
            lengthLimit={{ min: 4, max: 50, label: intl.get('NAME') }}
          >
            <Input
              placeholder={intl.get('PLEASE_INPUT_OBJECT_NAME', {
                object: intl.get(topAsset.label)
              })}
            />
          </FormInputItem>
          <Form.Item name='type' hidden={true} initialValue={topAsset.id}>
            <Input />
          </Form.Item>
        </Form>
      )}
      {type === 'point' && (
        <Form form={formPoint} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
          <EditContent asset={asset} form={formPoint} />
        </Form>
      )}
    </Modal>
  );
};
