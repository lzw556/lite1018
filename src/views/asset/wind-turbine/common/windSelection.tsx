import { Checkbox, Form, Modal, ModalProps, Row, Col, Button } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import * as React from 'react';
import { AssetRow, exportAssets } from '../..';
import { getFilename } from '../../../../utils/format';
import { getProject } from '../../../../utils/session';
import { SELECT_WIND_TURBINE } from './types';

export const WindSelection: React.FC<{ winds: AssetRow[]; onSuccess: () => void } & ModalProps> = (
  props
) => {
  const [form] = Form.useForm();
  const [selected, setSelected] = React.useState<CheckboxValueType[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleUpload = (windIds?: number[]) => {
    exportAssets(getProject(), windIds)
      .then((res) => {
        if (!windIds) props.onSuccess();
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', getFilename(res));
        document.body.appendChild(link);
        link.click();
      })
      .finally(() => {
        setLoading(false);
        form.resetFields();
        setSelected([]);
      });
  };

  return (
    <Modal
      {...props}
      title={SELECT_WIND_TURBINE}
      footer={[
        <Button key='back' onClick={(e) => props.onCancel && props.onCancel(e as any)}>
          取消
        </Button>,
        <Button
          key='submitall'
          type='primary'
          onClick={() => {
            setLoading(true);
            handleUpload();
          }}
          loading={loading}
        >
          导出全部
        </Button>,
        <Button
          key='submit'
          type='primary'
          disabled={selected.length === 0}
          onClick={() => handleUpload(selected as number[])}
        >
          导出
        </Button>
      ]}
    >
      <Form form={form}>
        <Form.Item name='asset_ids' noStyle>
          <Checkbox.Group style={{ width: '100%' }} onChange={(values) => setSelected(values)}>
            <Row>
              {props.winds.map(({ id, name }) => (
                <Col span={8} key={id}>
                  <Checkbox value={id}>{name}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};
