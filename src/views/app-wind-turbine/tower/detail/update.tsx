import React from 'react';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import intl from 'react-intl-universal';
import { generateColProps } from '../../../../utils/grid';
import { ModalFormProps } from '../../../../types/common';
import { Flex } from '../../../../components';
import { FormInputItem } from '../../../../components/formInputItem';
import { Asset, AssetModel, AssetRow, updateAsset, useContext } from '../../../asset-common';
import { tower, wind } from '../../constants';
import { useParentTypes } from '../../utils';

export const Update = (props: ModalFormProps & { asset: AssetRow }) => {
  const { asset, onSuccess } = props;
  const { assets } = useContext();
  const [form] = Form.useForm<AssetModel>();
  const { label } = wind;
  const { type } = tower;
  const parentTypes = useParentTypes(type);
  const winds = assets.filter((a) => parentTypes.map(({ type }) => type).includes(a.type));

  return (
    <Row>
      <Col {...generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 })}>
        <Form form={form} labelCol={{ span: 6 }} initialValues={{ ...Asset.convert(asset) }}>
          <FormInputItem
            label={intl.get('NAME')}
            name='name'
            requiredMessage={intl.get('PLEASE_ENTER_NAME')}
            lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
          >
            <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
          </FormInputItem>
          <Form.Item name='type' hidden={true} initialValue={type}>
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.get(label)}
            name='parent_id'
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })
              }
            ]}
          >
            <Select
              placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}
            >
              {winds.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.get('INDEX_NUMBER')}
            name={['attributes', 'index']}
            initialValue={1}
          >
            <Select>
              {[1, 2, 3, 4, 5].map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Flex style={{ marginTop: 12 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values) => {
                  try {
                    updateAsset(asset.id, values).then(onSuccess);
                  } catch (error) {
                    console.log(error);
                  }
                });
              }}
            >
              {intl.get('SAVE')}
            </Button>
          </Flex>
        </Form>
      </Col>
    </Row>
  );
};
