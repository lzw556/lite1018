import { Form, Input, Modal, ModalProps, Radio, Select } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../../../constants/validator';
import { addAsset, getAssets } from '../../../services';
import { Asset, AssetRow } from '../../../types';
import {
  PLEASE_SELECT_AREA,
  AREA,
  AREA_ASSET_TYPE_ID,
  CREATE_AREA_ASSET,
  AREA_ASSET_NAME,
  PLEASE_INPUT_AREA_ASSET_NAME,
  AREA_ASSET_TYPE,
  AREA_ASSET_TYPES,
  PLEASE_SELECT_AREA_ASSET_TYPE
} from '../../config';

export const AreaAssetCreate: React.FC<
  ModalProps & { parentId?: number; onSuccess: () => void }
> = (props) => {
  const { parentId, onSuccess } = props;
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    if (parentId === undefined) {
      getAssets({ type: AREA_ASSET_TYPE_ID }).then(setParents);
    }
  }, [parentId]);

  return (
    <Modal
      {...{
        title: CREATE_AREA_ASSET,
        cancelText: '取消',
        okText: '添加',
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
      <Form form={form} labelCol={{ span: 6 }} validateMessages={defaultValidateMessages}>
        <Form.Item
          label={AREA_ASSET_TYPE}
          name='type'
          rules={[{ required: true, message: PLEASE_SELECT_AREA_ASSET_TYPE }]}
        >
          <Radio.Group>
            {AREA_ASSET_TYPES.map((t) => (
              <Radio key={t.key} value={t.key}>
                {t.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item label={AREA_ASSET_NAME} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={PLEASE_INPUT_AREA_ASSET_NAME} />
        </Form.Item>
        {parents?.length > 0 && parentId === undefined ? (
          <Form.Item
            label={AREA}
            name='parent_id'
            rules={[{ required: true, message: PLEASE_SELECT_AREA }]}
          >
            <Select placeholder={PLEASE_SELECT_AREA}>
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
      </Form>
    </Modal>
  );
};
