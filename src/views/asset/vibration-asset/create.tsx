import { Col, Form, Input, ModalProps, Row, Select } from 'antd';
import * as React from 'react';
import { addAsset, getAssets } from '../services';
import { Asset, AssetCategoryKey, AssetCategoryLabel, AssetRow } from '../types';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';
import { getParents } from '../common/utils';
import { ModalWrapper } from '../../../components/modalWrapper';
import { getDefaultSettings, Settings } from './settings';

export const CreateVibrationAsset: React.FC<
  ModalProps & { parentId?: number; onSuccess: () => void }
> = (props) => {
  const { parentId, onSuccess } = props;
  const [form] = Form.useForm<Asset>();
  const {
    root: { key },
    last
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [type, setType] = React.useState<number | undefined>();
  React.useEffect(() => {
    if (parentId === undefined) {
      getAssets({ parent_id: 0, type: key }).then((assets) => setParents(getParents(assets)));
    }
  }, [parentId, key]);

  return (
    <ModalWrapper
      {...{
        title: intl.get('CREATE_SOMETHING', { something: intl.get(last?.[0]?.label) }),
        okText: intl.get('CREATE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset({ ...values, parent_id: values.parent_id ?? parentId ?? 0 }).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} layout='vertical'>
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
                options={[
                  {
                    label: intl.get(AssetCategoryLabel.VIBRATION_MOTOR),
                    value: AssetCategoryKey.VIBRATION_MOTOR
                  }
                ]}
                onChange={(type) => {
                  setType(type);
                  form.setFieldsValue(getDefaultSettings(type) as any);
                }}
              />
            </FormInputItem>
          </Col>
          <Col span={12}>
            {parents?.length > 0 && parentId === undefined ? (
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
              <Form.Item name='parent_id' hidden={true} initialValue={parentId}>
                <Input />
              </Form.Item>
            )}
          </Col>
        </Row>
        {type !== undefined && <Settings key={type} type={type} />}
      </Form>
    </ModalWrapper>
  );
};
