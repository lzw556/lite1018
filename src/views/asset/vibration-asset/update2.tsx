import { Button, Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { Asset, AssetCategoryKey, AssetCategoryLabel, AssetRow } from '../types';
import { getAssets, updateAsset } from '../services';
import { convertRow } from '../common/utils';
import { FormInputItem } from '../../../components/formInputItem';
import { Settings } from './settings';

export const UpdateVibrationAsset2 = (props: { asset: AssetRow; onSuccess: () => void }) => {
  const { asset, onSuccess } = props;
  const [form] = Form.useForm<Asset>();
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ parent_id: 0 }).then(setParents);
  }, []);

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{ ...convertRow(asset) }}
      style={{ width: 600 }}
    >
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <FormInputItem
            label={intl.get('NAME')}
            name='name'
            requiredMessage={intl.get('PLEASE_ENTER_NAME')}
            lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
          >
            <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
          </FormInputItem>
        </Col>
        <Col span={12}>
          <FormInputItem
            label={intl.get('TYPE')}
            name='type'
            requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('TYPE')
            })}
          >
            <Select
              disabled
              options={[
                {
                  label: intl.get(AssetCategoryLabel.VIBRATION_MOTOR),
                  value: AssetCategoryKey.VIBRATION_MOTOR
                }
              ]}
            />
          </FormInputItem>
        </Col>
        <Col span={12}>
          {parents?.length > 0 && asset.parentId !== 0 ? (
            <Form.Item label={intl.get('PARENT_ASSET')} name='parent_id'>
              <Select
                placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                  something: intl.get('PARENT_ASSET')
                })}
              >
                {parents.map(({ id, name, attributes }) => (
                  <Select.Option key={id} value={id} attributes={attributes}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item name='parent_id' hidden={true} initialValue={asset.parentId}>
              <Input />
            </Form.Item>
          )}
        </Col>
      </Row>
      <Settings key={asset.type} type={asset.type} />
      <Form.Item>
        <Button
          type='primary'
          onClick={() => {
            form.validateFields().then((values) => {
              try {
                updateAsset(asset.id, values).then(() => {
                  onSuccess();
                });
              } catch (error) {
                console.log(error);
              }
            });
          }}
        >
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};
