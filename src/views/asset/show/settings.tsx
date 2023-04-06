import { Button, Form } from 'antd';
import React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { isMobile } from '../../../utils/deviceDetection';
import { getAsset, updateAsset } from '../services';
import { Asset, AssetRow } from '../types';
import { UpdateAssetForm } from '../manage/updateForm';
import intl from 'react-intl-universal';

export const WindTurbineSet = ({ wind, onSuccess }: { wind: AssetRow; onSuccess: () => void }) => {
  const [form] = Form.useForm<Asset>();

  return (
    <ShadowCard>
      <UpdateAssetForm asset={wind} form={form} style={{ width: isMobile ? '100%' : '50%' }}>
        <Form.Item wrapperCol={{ offset: 6 }}>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                try {
                  updateAsset(wind.id, values)
                    .then(() => getAsset(wind.id))
                    .then(onSuccess);
                } catch (error) {
                  console.log(error);
                }
              });
            }}
          >
            {intl.get('SAVE')}
          </Button>
        </Form.Item>
      </UpdateAssetForm>
    </ShadowCard>
  );
};
