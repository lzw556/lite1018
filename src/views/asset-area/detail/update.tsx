import React from 'react';
import { Button, Col, Form, Row } from 'antd';
import intl from 'react-intl-universal';
import { Flex } from '../../../components';
import { generateColProps } from '../../../utils/grid';
import { AssetRow, updateAsset, AssetModel } from '../../asset-common';
import { UpdateFormItems } from '../updateFormItems';

export const Update = ({ asset, onSuccess }: { asset: AssetRow; onSuccess: () => void }) => {
  const [form] = Form.useForm<AssetModel>();

  return (
    <Row>
      <Col {...generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 })}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          initialValues={{
            name: asset.name,
            parent_id: asset.parentId > 0 ? asset.parentId : undefined
          }}
        >
          <UpdateFormItems asset={asset} />
          <Flex style={{ marginTop: 12 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values) => {
                  try {
                    updateAsset(asset.id, { ...values, type: asset.type }).then(() => {
                      onSuccess();
                    });
                  } catch (error) {
                    console.log(error);
                  }
                });
              }}
            >
              {intl.get('SAVE')}
            </Button>
          </Flex>
        </Form>
      </Col>
    </Row>
  );
};
