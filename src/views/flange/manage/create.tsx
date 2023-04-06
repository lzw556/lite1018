import { Checkbox, Form, Input, InputNumber, Modal, ModalProps, Select } from 'antd';
import React from 'react';
import { SAMPLING_OFFSET, SAMPLING_PERIOD_2 } from '../../../constants';
import { addAsset, Asset, AssetCategoryKey, AssetRow, getAssets } from '../../asset';
import { FLANGE_TYPES } from '../types';
import { AttributeFormItem } from './attributeFormItem';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';

export const FlangeCreate: React.FC<
  ModalProps & {
    onSuccess: () => void;
    parentId?: number;
  }
> = (props) => {
  const {
    root: { key, label },
    last
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const { parentId, onSuccess } = props;
  const [form] = Form.useForm<Asset>();
  const [isFlangePreload, setIsFlangePreload] = React.useState(false);

  React.useEffect(() => {
    if (parentId === undefined) {
      getAssets({ type: key, parent_id: 0 }).then(setParents);
    }
  }, [parentId, key]);

  return (
    <Modal
      {...{
        title: intl.get('CREATE_SOMETHING', { something: intl.get(last.label) }),
        cancelText: intl.get('CANCEL'),
        okText: intl.get('CREATE'),
        bodyStyle: { overflow: 'auto', maxHeight: 610 },
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            const _values = {
              ...values,
              attributes: {
                ...values.attributes,
                monitoring_points_num: Number(values.attributes?.monitoring_points_num),
                sub_type: Number(values.attributes?.sub_type),
                initial_preload: Number(values.attributes?.initial_preload),
                initial_pressure: Number(values.attributes?.initial_pressure)
              }
            };
            try {
              addAsset(_values as any).then(() => {
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
        <Form.Item name='type' hidden={true} initialValue={AssetCategoryKey.FLANGE}>
          <Input />
        </Form.Item>
        {parents.length > 0 && parentId === undefined ? (
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
              {parents.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
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
        <Form.Item
          label={intl.get('FLANGE_TYPE')}
          name={['attributes', 'type']}
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('FLANGE_TYPE') })
            }
          ]}
        >
          <Select
            placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
              something: intl.get('FLANGE_TYPE')
            })}
          >
            {FLANGE_TYPES.map(({ value, label }) => (
              <Select.Option key={value} value={value}>
                {intl.get(label)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={intl.get('INDEX_NUMBER')} name={['attributes', 'index']} initialValue={1}>
          <Select>
            {[1, 2, 3, 4, 5].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <AttributeFormItem label={intl.get('RATING')} name='normal' />
        <AttributeFormItem label={intl.get('INITIAL_VALUE')} name='initial' />
        <AttributeFormItem label={intl.get('ALARM_LEVEL_MINOR_TITLE')} name='info' />
        <AttributeFormItem label={intl.get('ALARM_LEVEL_MAJOR_TITLE')} name='warn' />
        <AttributeFormItem label={intl.get('ALARM_LEVEL_CRITICAL_TITLE')} name='danger' />
        <Form.Item
          name={['attributes', 'sub_type']}
          valuePropName='checked'
          wrapperCol={{ offset: 6 }}
          initialValue={false}
        >
          <Checkbox onChange={(e) => setIsFlangePreload(e.target.checked)}>
            {intl.get('CALCULATE_FLANGE_PRELOAD')}
          </Checkbox>
        </Form.Item>
        {isFlangePreload && (
          <>
            <FormInputItem
              label={intl.get('NUMBER_OF_BOLT')}
              name={['attributes', 'monitoring_points_num']}
              requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('NUMBER_OF_BOLT')
              })}
              numericRule={{
                isInteger: true,
                min: 1,
                message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
              }}
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('NUMBER_OF_BOLT')
              })}
            />
            <Form.Item
              label={intl.get('SAMPLING_PERIOD')}
              name={['attributes', 'sample_period']}
              rules={[
                {
                  required: true,
                  message: intl.get('PLEASE_SELECT_SOMETHING', {
                    something: intl.get('SAMPLING_PERIOD')
                  })
                }
              ]}
            >
              <Select
                placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                  something: intl.get('SAMPLING_PERIOD')
                })}
              >
                {SAMPLING_PERIOD_2.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {intl.get(item.text)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={intl.get('SAMPLING_OFFSET')}
              name={['attributes', 'sample_time_offset']}
              rules={[
                {
                  required: true,
                  message: intl.get('PLEASE_SELECT_SOMETHING', {
                    something: intl.get('SAMPLING_OFFSET')
                  })
                }
              ]}
            >
              <Select
                placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                  something: intl.get('SAMPLING_OFFSET')
                })}
              >
                {SAMPLING_OFFSET.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {intl.get(item.text)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <FormInputItem
              label={intl.get('INITIAL_PRELOAD')}
              name={['attributes', 'initial_preload']}
              requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('INITIAL_PRELOAD')
              })}
              numericRule={{
                message: intl.get('PLEASE_ENTER_NUMERIC')
              }}
              numericChildren={
                <InputNumber
                  placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('INITIAL_PRELOAD')
                  })}
                  style={{ width: '100%' }}
                  controls={false}
                  addonAfter='kN'
                />
              }
            />
            <FormInputItem
              label={intl.get('INITIAL_PRESSURE')}
              name={['attributes', 'initial_pressure']}
              requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('INITIAL_PRESSURE')
              })}
              numericRule={{
                message: intl.get('PLEASE_ENTER_NUMERIC')
              }}
              numericChildren={
                <InputNumber
                  placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('INITIAL_PRELOAD')
                  })}
                  style={{ width: '100%' }}
                  controls={false}
                  addonAfter='MPa'
                />
              }
            />
          </>
        )}
      </Form>
    </Modal>
  );
};
