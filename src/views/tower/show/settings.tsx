import { Button, Form } from 'antd';
import React from 'react';
import { isMobile } from '../../../utils/deviceDetection';
import { Asset, AssetRow, updateAsset } from '../../asset';
import intl from 'react-intl-universal';
import { convertRow } from '../../asset/common/utils';
import { UpdateForm } from '../manage/updateForm';

export const TowerSet = ({
  tower,
  onUpdateSuccess
}: {
  tower: AssetRow;
  onUpdateSuccess: () => void;
}) => {
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    if (tower) {
      form.resetFields();
      const values = convertRow(tower);
      if (values) form.setFieldsValue(values);
    }
  }, [tower, form]);
  return (
    <UpdateForm tower={tower} form={form} style={{ width: isMobile ? '100%' : '50%' }}>
      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button
          type='primary'
          onClick={() => {
            form.validateFields().then((values) => {
              try {
                updateAsset(tower.id, values).then(onUpdateSuccess);
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
  );
};
