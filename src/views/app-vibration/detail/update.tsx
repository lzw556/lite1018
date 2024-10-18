import React from 'react';
import { Button, Col, Form, Row } from 'antd';
import intl from 'react-intl-universal';
import { Flex } from '../../../components';
import { generateColProps } from '../../../utils/grid';
import { AssetModel, AssetRow, updateAsset } from '../../asset-common';
import { UpdateAssetFormItems, getByType, motor } from '../../asset-variant';

export const Update = ({ asset, onSuccess }: { asset: AssetRow; onSuccess: () => void }) => {
  const { name, parentId, type } = asset;
  const [form] = Form.useForm<AssetModel>();

  return (
    <Row>
      <Col {...generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 })}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          initialValues={{
            name,
            parent_id: parentId,
            type,
            ...getByType(type)?.settings?.default
          }}
        >
          <UpdateAssetFormItems asset={asset} types={[motor]} />
          <Flex>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values) => {
                  try {
                    updateAsset(asset.id, { ...values, type }).then(() => {
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
