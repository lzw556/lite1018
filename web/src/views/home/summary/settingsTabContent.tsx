import { Button, Form, Input } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { isMobile } from '../../../utils/deviceDetection';
import { EditContent } from '../assetList/editContent';
import { AssetRow } from '../assetList/props';
import * as AppConfig from '../../../config';

export const SettingsTabContent: React.FC<{
  asset?: AssetRow;
  form: any;
  onSubmit: (values: any) => void;
}> = ({ asset, form, onSubmit }) => {
  const renderFormItems = () => {
    if (asset) {
      if (asset.type === AppConfig.use(window.assetCategory).assetType.id) {
        return (
          <>
            <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
              <Input
                placeholder={`请填写${AppConfig.use(window.assetCategory).assetType.label}名称`}
              />
            </Form.Item>
            <Form.Item
              name='type'
              hidden={true}
              initialValue={AppConfig.use(window.assetCategory).assetType.id}
            ></Form.Item>
          </>
        );
      } else {
        return <EditContent initialIsFlangePreload={!!asset.attributes?.sub_type} />;
      }
    } else {
      return null;
    }
  };

  return (
    <ShadowCard>
      <Form
        form={form}
        validateMessages={defaultValidateMessages}
        labelCol={{ span: 4 }}
        style={{ width: isMobile ? '100%' : '50%' }}
      >
        {renderFormItems()}
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
