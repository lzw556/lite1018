import { Button, Form, Input } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { defaultValidateMessages } from '../../../constants/validator';
import { isMobile } from '../../../utils/deviceDetection';
import { EditContent } from '../assetList/editContent';
import { AssetRow } from '../assetList/props';
import * as AppConfig from '../../../config';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

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
            <FormInputItem
              label={intl.get('NAME')}
              name='name'
              requiredMessage={intl.get('PLEASE_INPUT_OBJECT_NAME', {
                object: intl.get(AppConfig.use(window.assetCategory).assetType.label + '_LC')
              })}
              lengthLimit={{ min: 4, max: 50, label: intl.get('NAME') }}
            >
              <Input
                placeholder={intl.get('PLEASE_INPUT_OBJECT_NAME', {
                  object: intl.get(AppConfig.use(window.assetCategory).assetType.label + '_LC')
                })}
              />
            </FormInputItem>
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
        labelCol={{ span: 7 }}
        style={{ width: isMobile ? '100%' : '50%' }}
      >
        {renderFormItems()}
        <Form.Item wrapperCol={{ offset: 7 }}>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values: any) => {
                onSubmit(values);
              });
            }}
          >
            {intl.get('SAVE')}
          </Button>
        </Form.Item>
      </Form>
    </ShadowCard>
  );
};
