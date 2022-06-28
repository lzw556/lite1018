import { Button, Form } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { defaultValidateMessages } from '../../../constants/validator';
import { EditContent } from '../assetList/editContent';
import { AssetRow } from '../assetList/props';
import { AssetTypes } from '../common/constants';

export const SettingsTabContent: React.FC<{
  asset?: AssetRow;
  form: any;
  onSubmit: (values: any) => void;
}> = ({ asset, form, onSubmit }) => {
  return (
    <ShadowCard>
      <Form
        form={form}
        validateMessages={defaultValidateMessages}
        labelCol={{ span: 4 }}
        style={{ width: '50%' }}
      >
        <EditContent
          id={asset?.id}
          initialValues={Object.values(AssetTypes).find((type) => type.id === asset?.type)}
        />
        <Form.Item wrapperCol={{ offset: 2 }}>
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
