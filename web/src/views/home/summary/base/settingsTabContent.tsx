import { Button, Form, Input, Select } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { isMobile } from '../../../../utils/deviceDetection';
import * as AppConfig from '../../../../config';
import { AssetRow } from '../../assetList/props';
import { getAssets } from '../../assetList/services';

export const SettingsTabContent: React.FC<{
  asset?: AssetRow;
  form: any;
  onSubmit: (values: any) => void;
}> = ({ asset, form, onSubmit }) => {
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const topAsset = AppConfig.use('default').assetType;

  React.useEffect(() => {
    getAssets({ type: topAsset.id }).then((assets) =>
      setParents(assets.filter((_asset) => (asset ? asset.id !== _asset.id : true)))
    );
  }, [asset, topAsset.id]);

  return (
    <ShadowCard>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        validateMessages={defaultValidateMessages}
        style={{ width: isMobile ? '100%' : '50%' }}
      >
        <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={`请填写${topAsset.label}名称`} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={topAsset.id}>
          <Input />
        </Form.Item>
        {parents.length > 0 && (
          <Form.Item label='上级资产' name='parent_id' hidden={asset && asset.parentId === 0}>
            <Select allowClear={true}>
              {parents.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item wrapperCol={{ offset: 4 }}>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values: any) => {
                onSubmit(values);
              });
            }}
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    </ShadowCard>
  );
};
