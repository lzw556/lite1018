import React from 'react';
import { Form, Input } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../components/formInputItem';
import { ModalWrapper } from '../../components/modalWrapper';
import { ModalFormProps } from '../../types/common';
import { addAsset, AssetModel } from '../asset-common';
import { wind } from './constants';

export const Create = (props: ModalFormProps) => {
  const { onSuccess, ...rest } = props;
  const [form] = Form.useForm<AssetModel>();
  const { label, type } = wind;

  return (
    <ModalWrapper
      {...{
        afterClose: () => form.resetFields(),
        title: intl.get('CREATE_SOMETHING', { something: intl.get(label) }),
        okText: intl.get('CREATE'),
        ...rest,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset({ ...values, type }).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 6 }}>
        <FormInputItem
          label={intl.get('NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_ENTER_NAME')}
          lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
        </FormInputItem>
      </Form>
    </ModalWrapper>
  );
};
