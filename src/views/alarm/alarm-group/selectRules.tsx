import { Checkbox, Form, ModalProps, Row, Col, Button } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import * as React from 'react';
import { getFilename } from '../../../utils/format';
import { exportAlarmRules } from './services';
import { AlarmRule } from './types';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../../components/modalWrapper';

export const SelectRules: React.FC<{ rules: AlarmRule[]; onSuccess: () => void } & ModalProps> = (
  props
) => {
  const [form] = Form.useForm();
  const [selected, setSelected] = React.useState<CheckboxValueType[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleUpload = (ruleIds?: number[]) => {
    exportAlarmRules(ruleIds)
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', getFilename(res));
        document.body.appendChild(link);
        link.click();
        if (!ruleIds) props.onSuccess();
      })
      .finally(() => {
        setLoading(false);
        form.resetFields();
        setSelected([]);
      });
  };

  return (
    <ModalWrapper
      {...props}
      title={intl.get('SELECT_ALARM_RULE')}
      // width={isMobile ? '80%' : '50%'}
      footer={[
        <Button key='back' onClick={(e) => props.onCancel && props.onCancel(e as any)}>
          {intl.get('CANCEL')}
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
          {intl.get('EXPORT_ALL')}
        </Button>,
        <Button
          key='submit'
          type='primary'
          disabled={selected.length === 0}
          onClick={() => handleUpload(selected as number[])}
        >
          {intl.get('EXPORT')}
        </Button>
      ]}
    >
      <Form form={form}>
        <Form.Item name='asset_ids' noStyle>
          <Checkbox.Group style={{ width: '100%' }} onChange={(values) => setSelected(values)}>
            <Row style={{ width: '100%' }}>
              {props.rules.map(({ id, name }) => (
                <Col span={8} key={id}>
                  <Checkbox value={id}>{intl.get(name).d(name)}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </ModalWrapper>
  );
};
