import { Button, Form } from 'antd';
import React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { isMobile } from '../../../../utils/deviceDetection';
import { getAsset, updateAsset } from '../../services';
import { Asset, AssetRow } from '../../types';
import { useAssetsContext } from '../../components/assetsContext';
import { UpdateForm } from '../manage/updateForm';
import intl from 'react-intl-universal';

export const WindTurbineSet = (wind: AssetRow) => {
  const [form] = Form.useForm<Asset>();
  const { refresh } = useAssetsContext();

  return (
    <ShadowCard>
      <UpdateForm wind={wind} form={form} style={{ width: isMobile ? '100%' : '50%' }}>
        <Form.Item wrapperCol={{ offset: 8 }}>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                try {
                  updateAsset(wind.id, values)
                    .then(() => getAsset(wind.id))
                    .then(refresh);
                } catch (error) {
                  console.log(error);
                }
              });
            }}
          >
            {intl.get('SAVE')}
          </Button>
        </Form.Item>
      </UpdateForm>
    </ShadowCard>
  );
};
