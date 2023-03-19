import { Button, Form } from 'antd';
import React from 'react';
import { isMobile } from '../../../utils/deviceDetection';
import { Asset, AssetRow, updateAsset } from '../../asset';
import { convertRow } from '../../asset/wind-turbine';
import { UpdateForm } from '../manage/updateForm';

export const FlangeSet = ({
  flange,
  onUpdateSuccess
}: {
  flange: AssetRow;
  onUpdateSuccess: () => void;
}) => {
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    if (flange) {
      form.resetFields();
      const values = convertRow(flange);
      if (values) form.setFieldsValue(values);
    }
  }, [flange, form]);
  return (
    <UpdateForm flange={flange} form={form} style={{ width: isMobile ? '100%' : '50%' }}>
      <Form.Item wrapperCol={{ offset: 5 }}>
        <Button
          type='primary'
          onClick={() => {
            form.validateFields().then((values) => {
              try {
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
                updateAsset(flange.id, _values as any).then(onUpdateSuccess);
              } catch (error) {
                console.log(error);
              }
            });
          }}
        >
          保存
        </Button>
      </Form.Item>
    </UpdateForm>
  );
};
