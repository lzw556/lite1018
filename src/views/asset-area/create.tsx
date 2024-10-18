import React from 'react';
import { Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../components/formInputItem';
import { ModalWrapper } from '../../components/modalWrapper';
import { ModalFormProps } from '../../types/common';
import { addAsset, AssetModel, useContext } from '../asset-common';
import { area, isAssetAreaParent } from '../asset-variant';

export const Create = (props: ModalFormProps & { parentId?: number }) => {
  const { onSuccess, parentId, ...rest } = props;
  const [form] = Form.useForm<AssetModel>();
  const { label, type } = area;
  const { assets } = useContext();
  const parents = parentId ? [] : assets.filter(isAssetAreaParent);

  const renderParent = () => {
    if (parentId) {
      return (
        <Form.Item name='parent_id' hidden={true} initialValue={parentId}>
          <Input />
        </Form.Item>
      );
    } else if (parents.length >= 0) {
      return (
        <Form.Item label={intl.get(label)} name='parent_id'>
          <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}>
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    }
  };

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
              addAsset({ ...values, parent_id: values.parent_id ?? 0, type }).then(() => {
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
        {renderParent()}
      </Form>
    </ModalWrapper>
  );
};
