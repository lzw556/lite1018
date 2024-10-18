import React from 'react';
import { Form } from 'antd';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../components/modalWrapper';
import { ModalFormProps } from '../../types/common';
import { AssetCategory, AssetModel, AssetRow, updateAsset } from '../asset-common';
import { UpdateFormItems } from './updateFormItems';
import { getByType } from './utils';

export const UpdateModal = (
  props: ModalFormProps & { asset: AssetRow; types: AssetCategory[] }
) => {
  const { asset, onSuccess, types, ...rest } = props;
  const { id, name, parentId, type } = asset;
  const [form] = Form.useForm<AssetModel>();
  const label = intl.get('ASSET');

  return (
    <ModalWrapper
      {...{
        afterClose: () => form.resetFields(),
        title: intl.get('EDIT_SOMETHING', { something: label }),
        okText: intl.get('SAVE'),
        ...rest,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              updateAsset(id, { ...values, type }).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form
        form={form}
        labelCol={{ span: 7 }}
        initialValues={{ name, parent_id: parentId, type, ...getByType(type)?.settings?.default }}
      >
        <UpdateFormItems asset={asset} types={types} />
      </Form>
    </ModalWrapper>
  );
};
