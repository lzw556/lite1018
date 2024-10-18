import React from 'react';
import { Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../components/modalWrapper';
import { FormInputItem } from '../../components/formInputItem';
import { ModalFormProps } from '../../types/common';
import { addAsset, AssetCategory, AssetModel } from '../asset-common';
import { SettingFormItems } from './settingFormItems';
import { getByType, useParents } from './utils';
import { TypeFormItem } from './typeFormItem';

export const Create = (props: ModalFormProps & { parentId?: number; types: AssetCategory[] }) => {
  const { onSuccess, parentId, types } = props;
  const [form] = Form.useForm<AssetModel>();
  const [type, setType] = React.useState<number | undefined>();
  const label = intl.get('ASSET');
  const parents = useParents();

  const renderParent = () => {
    if (parentId) {
      return (
        <Form.Item name='parent_id' hidden={true} initialValue={parentId}>
          <Input />
        </Form.Item>
      );
    } else if (parents.length >= 0) {
      return (
        <Form.Item
          label={label}
          name='parent_id'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', { something: label })
            }
          ]}
        >
          <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: label })}>
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
        title: intl.get('CREATE_SOMETHING', { something: label }),
        okText: intl.get('CREATE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset(values).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 7 }}>
        <fieldset>
          <legend>{intl.get('BASIC_INFORMATION')}</legend>
          <FormInputItem
            label={intl.get('NAME')}
            name='name'
            requiredMessage={intl.get('PLEASE_ENTER_NAME')}
            lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
          >
            <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
          </FormInputItem>
          {renderParent()}
          <TypeFormItem
            onChange={(type) => {
              debugger;
              setType(type);
              form.setFieldsValue(getByType(type)?.settings?.default as any);
            }}
            types={types}
          />
        </fieldset>
        {type && <SettingFormItems key={type} type={type} />}
      </Form>
    </ModalWrapper>
  );
};
