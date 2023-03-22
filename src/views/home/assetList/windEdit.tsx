import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages } from '../../../constants/validator';
import { EditFormPayload } from '../common/useActionBarStatus';
import { Asset, convertRow } from './props';
import { addAsset, updateAsset } from './services';
import * as AppConfig from '../../../config';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

export const WindEdit: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const windConfig = AppConfig.use('wind');
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    if (asset) {
      form.resetFields();
      const values = convertRow(asset);
      if (values) form.setFieldsValue(values);
    }
  }, [asset, form]);

  const doUpdating = !!asset;

  return (
    <Modal
      {...{
        title: doUpdating
          ? intl.get('EDIT_SOMETHING', { something: intl.get(windConfig.assetType.label) })
          : intl.get('CREATE_SOMETHING', {
              something: intl.get(windConfig.assetType.label + '_LC')
            }),
        cancelText: intl.get('CANCEL'),
        okText: doUpdating ? intl.get('UPDATE') : intl.get('CREATE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              if (!doUpdating) {
                addAsset(values).then(() => {
                  onSuccess();
                });
              } else if (asset) {
                updateAsset(asset.id, values).then(() => {
                  onSuccess();
                });
              }
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
        <FormInputItem
          label={intl.get('NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_INPUT_OBJECT_NAME', {
            object: intl.get(windConfig.assetType.label + '_LC')
          })}
          lengthLimit={{
            min: 4,
            max: 50,
            label: intl.get(windConfig.assetType.label).toLowerCase()
          }}
        >
          <Input
            placeholder={intl.get('PLEASE_INPUT_OBJECT_NAME', {
              object: intl.get(windConfig.assetType.label + '_LC')
            })}
          />
        </FormInputItem>
        <Form.Item name='type' hidden={true} initialValue={windConfig.assetType.id}></Form.Item>
      </Form>
    </Modal>
  );
};
