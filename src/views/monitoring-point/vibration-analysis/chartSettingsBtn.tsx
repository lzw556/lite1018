import React from 'react';
import intl from 'react-intl-universal';
import { Button, Col, Divider, Form, InputNumber, Popover, Row, Select, Space } from 'antd';
import {
  defaultChartSettings,
  useChartSettingsItems,
  ChartSettings,
  ChartSettingsItem,
  ChartSettingsRangeItem
} from './useAnalysis';
import { SettingOutlined } from '@ant-design/icons';

export const ChartSettingsBtn = ({
  activeKey,
  onSetChartSettings
}: {
  activeKey: string;
  onSetChartSettings?: (settings: ChartSettings) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [chartSettings, setChartSettings] = React.useState(defaultChartSettings);
  const [form] = Form.useForm<ChartSettings>();
  const items = useChartSettingsItems(
    activeKey,
    (range) => {
      form.setFieldsValue({ cutoff_range_low: range[0], cutoff_range_high: range[1] });
    },
    [chartSettings.cutoff_range_low!, chartSettings.cutoff_range_high!]
  );

  if (items.length === 0) {
    return null;
  }
  return (
    <>
      <Popover
        content={
          <Form
            layout='vertical'
            form={form}
            style={{ width: 220, padding: 10 }}
            initialValues={defaultChartSettings}
          >
            {items.map((item, i) => {
              if (item.hasOwnProperty('range')) {
                const [first, last] = (item as ChartSettingsRangeItem).range;
                return (
                  <Form.Item key={i} label={item.label ? intl.get(item.label) : item.label}>
                    <Space>
                      <Form.Item {...first} noStyle>
                        <InputNumber />
                      </Form.Item>
                      -
                      <Form.Item {...last} noStyle>
                        <InputNumber />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                );
              } else {
                const _item = item as ChartSettingsItem;
                return (
                  <Form.Item
                    {...{ ..._item, label: _item.label ? intl.get(_item.label) : _item.label }}
                    key={i}
                  >
                    {_item.options ? (
                      <Select
                        {...{
                          ..._item,
                          options: _item.options.map((o) => ({ ...o, label: intl.get(o.label) }))
                        }}
                      />
                    ) : (
                      <InputNumber style={{ width: '100%' }} />
                    )}
                  </Form.Item>
                );
              }
            })}
            <Form.Item noStyle>
              <Row justify='end'>
                <Col>
                  <Space>
                    <Button size='small' onClick={() => setOpen(false)}>
                      {intl.get('CANCEL')}
                    </Button>
                    <Button
                      size='small'
                      type='primary'
                      onClick={() => {
                        form.validateFields().then((values) => {
                          const cutoff_range_low =
                            values.cutoff_range_low ?? defaultChartSettings.cutoff_range_low;
                          const cutoff_range_high =
                            values.cutoff_range_high ?? defaultChartSettings.cutoff_range_high;
                          const filter_order =
                            values.filter_order ?? defaultChartSettings.filter_order;
                          const f_l = values.f_l ?? defaultChartSettings.f_l;
                          const f_h = values.f_h ?? defaultChartSettings.f_h;
                          const finalValues = {
                            ...defaultChartSettings,
                            ...values,
                            cutoff_range_low,
                            cutoff_range_high,
                            filter_order,
                            f_l,
                            f_h
                          };
                          setChartSettings((prev) => ({
                            ...prev,
                            ...finalValues
                          }));
                          onSetChartSettings?.(finalValues);
                          setOpen(false);
                        });
                      }}
                    >
                      {intl.get('OK')}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        }
        open={open}
        placement='leftTop'
        trigger='click'
      >
        <SettingOutlined onClick={() => setOpen(true)} />
      </Popover>
      <Divider type='vertical' />
    </>
  );
};
