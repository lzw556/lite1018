import { Button, Col, Divider, Form, Input, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTitle } from '../../../components/pageTitle';
import ShadowCard from '../../../components/shadowCard';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';
import { isMobile } from '../../../utils/deviceDetection';
import { getAlarmRule, updateAlarmRule } from './services';
import { AlarmRule } from './types';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { useAppConfigContext } from '../../asset';
import { MONITORING_POINT } from '../../monitoring-point';
import { translateMetricName } from '.';
import { SelfLink } from '../../../components/selfLink';

export default function UpdateAlarmRuleGroup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const config = useAppConfigContext();

  const [form] = Form.useForm();
  const [rule, setRule] = React.useState<AlarmRule>();
  const [smallSize, setSmallSize] = React.useState(window.innerWidth < 1500);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => setSmallSize(window.innerWidth < 1500));
  }, []);
  React.useEffect(() => {
    getAlarmRule(Number(id)).then(setRule);
  }, [id]);

  React.useEffect(() => {
    if (rule) {
      form.setFieldsValue(rule);
    }
  }, [rule, form]);

  if (!rule) return null;
  return (
    <>
      <PageTitle
        items={[
          { title: <SelfLink to='/alarmRules'>{intl.get('ALARM_RULES')}</SelfLink> },
          { title: intl.get('EDIT_ALARM_RULE') }
        ]}
      />
      <ShadowCard>
        <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
          <Form.Item
            label={intl.get('OBJECT_TYPE', { object: intl.get(MONITORING_POINT) })}
            name='type'
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_SELECT_SOMETHING', {
                  something: intl.get('OBJECT_TYPE', { object: intl.get(MONITORING_POINT) })
                })
              }
            ]}
          >
            <Select disabled={true} style={{ width: isMobile ? '75%' : 435 }}>
              {MONITORING_POINTS.get(config)?.map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {intl.get(label)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <FormInputItem
            name='name'
            label={intl.get('NAME')}
            requiredMessage={intl.get('PLEASE_ENTER_NAME')}
            lengthLimit={{ min: 4, max: 16, label: intl.get('NAME').toLowerCase() }}
          >
            <Input
              placeholder={intl.get('PLEASE_ENTER_NAME')}
              style={{ width: isMobile ? '75%' : 435 }}
            />
          </FormInputItem>
          <Form.Item label={intl.get('DESCRIPTION')} name='description'>
            <Input
              placeholder={intl.get('PLEASE_ENTER_DESCRIPTION')}
              style={{ width: isMobile ? '75%' : 435 }}
            />
          </Form.Item>
          <Divider />
          <Form.List name='rules'>
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restFields }, index) => (
                  <div key={key} style={{ position: 'relative' }}>
                    {smallSize && (
                      <>
                        <Form.Item label={intl.get('NAME')} {...restFields} name={[name, 'name']}>
                          <Input
                            readOnly={index < rule.rules.length}
                            style={{ width: isMobile ? '75%' : 435 }}
                            disabled={true}
                          />
                        </Form.Item>
                        <Form.Item label={intl.get('INDEX')}>
                          <Input
                            disabled={true}
                            value={translateMetricName(rule.rules[index].metric.name)}
                            style={{ width: isMobile ? '75%' : 435 }}
                          />
                        </Form.Item>
                        <FormInputItem
                          label={intl.get('DURATION')}
                          {...restFields}
                          name={[name, 'duration']}
                          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                            something: intl.get('DURATION')
                          })}
                          numericRule={{
                            isInteger: true,
                            min: 1,
                            message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                          }}
                          initialValue={1}
                          numericChildren={
                            <InputNumber
                              controls={false}
                              style={{ width: isMobile ? '75%' : 435 }}
                            />
                          }
                        />
                        <FormInputItem
                          label={intl.get('CONDITION')}
                          {...restFields}
                          name={[name, 'threshold']}
                          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                            something: intl.get('CONDITION')
                          })}
                          numericRule={{
                            isInteger: false
                          }}
                          numericChildren={
                            <InputNumber
                              style={{ width: isMobile ? '75%' : 435 }}
                              addonBefore={
                                <Form.Item
                                  {...restFields}
                                  name={[name, 'operation']}
                                  noStyle
                                  initialValue={'>='}
                                >
                                  <Select style={{ width: 65 }}>
                                    <Select.Option key={'>'} value={'>'}>
                                      &gt;
                                    </Select.Option>
                                    <Select.Option key={'>='} value={'>='}>
                                      &gt;=
                                    </Select.Option>
                                    <Select.Option key={'<'} value={'<'}>
                                      &lt;
                                    </Select.Option>
                                    <Select.Option key={'<='} value={'<='}>
                                      &lt;=
                                    </Select.Option>
                                  </Select>
                                </Form.Item>
                              }
                              controls={false}
                              addonAfter={
                                rule.rules.length > 0 && rule.rules[index]
                                  ? rule.rules[index].metric.unit
                                    ? intl
                                        .get(rule.rules[index].metric.unit)
                                        .d(rule.rules[index].metric.unit)
                                    : rule.rules[index].metric.unit
                                  : ''
                              }
                            />
                          }
                        />
                        <Form.Item
                          label={intl.get('SEVERITY')}
                          {...restFields}
                          name={[name, 'level']}
                          initialValue={3}
                        >
                          <Select style={{ width: isMobile ? '75%' : 435 }}>
                            <Select.Option key={1} value={1}>
                              {intl.get('ALARM_LEVEL_MINOR')}
                            </Select.Option>
                            <Select.Option key={2} value={2}>
                              {intl.get('ALARM_LEVEL_MAJOR')}
                            </Select.Option>
                            <Select.Option key={3} value={3}>
                              {intl.get('ALARM_LEVEL_CRITICAL')}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </>
                    )}
                    {!smallSize && (
                      <>
                        <FormInputItem
                          label={intl.get('NAME')}
                          {...restFields}
                          name={[name, 'name']}
                        >
                          <Input style={{ width: isMobile ? '75%' : 435 }} disabled={true} />
                        </FormInputItem>
                        <Row>
                          <Col xl={6} offset={1}>
                            <Form.Item
                              labelCol={{ span: 8 }}
                              label={intl.get('INDEX')}
                              style={{ marginBottom: 0 }}
                            >
                              <Input
                                disabled={true}
                                value={translateMetricName(rule.rules[index].metric.name)}
                              />
                            </Form.Item>
                          </Col>
                          <Col xl={6}>
                            <FormInputItem
                              labelCol={{ span: 8 }}
                              label={intl.get('DURATION')}
                              {...restFields}
                              name={[name, 'duration']}
                              requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                                something: intl.get('DURATION')
                              })}
                              numericRule={{
                                isInteger: true,
                                min: 1,
                                message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                              }}
                              initialValue={1}
                              style={{ marginBottom: 0 }}
                            />
                          </Col>
                          <Col xl={6}>
                            <FormInputItem
                              labelCol={{ span: 8 }}
                              label={intl.get('CONDITION')}
                              style={{ marginBottom: 0 }}
                              {...restFields}
                              name={[name, 'threshold']}
                              requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                                something: intl.get('CONDITION')
                              })}
                              numericRule={{
                                isInteger: false
                              }}
                              numericChildren={
                                <InputNumber
                                  addonBefore={
                                    <Form.Item
                                      {...restFields}
                                      name={[name, 'operation']}
                                      noStyle
                                      initialValue={'>='}
                                    >
                                      <Select style={{ width: 65 }}>
                                        <Select.Option key={'>'} value={'>'}>
                                          &gt;
                                        </Select.Option>
                                        <Select.Option key={'>='} value={'>='}>
                                          &gt;=
                                        </Select.Option>
                                        <Select.Option key={'<'} value={'<'}>
                                          &lt;
                                        </Select.Option>
                                        <Select.Option key={'<='} value={'<='}>
                                          &lt;=
                                        </Select.Option>
                                      </Select>
                                    </Form.Item>
                                  }
                                  controls={false}
                                  addonAfter={
                                    rule.rules.length > 0 && rule.rules[index]
                                      ? rule.rules[index].metric.unit
                                        ? intl
                                            .get(rule.rules[index].metric.unit)
                                            .d(rule.rules[index].metric.unit)
                                        : rule.rules[index].metric.unit
                                      : ''
                                  }
                                />
                              }
                            />
                          </Col>
                          <Col xl={5}>
                            <Form.Item
                              labelCol={{ span: 8 }}
                              label={intl.get('SEVERITY')}
                              {...restFields}
                              name={[name, 'level']}
                              initialValue={3}
                              style={{ marginBottom: 0 }}
                            >
                              <Select style={{ width: 120 }}>
                                <Select.Option key={1} value={1}>
                                  {intl.get('ALARM_LEVEL_MINOR')}
                                </Select.Option>
                                <Select.Option key={2} value={2}>
                                  {intl.get('ALARM_LEVEL_MAJOR')}
                                </Select.Option>
                                <Select.Option key={3} value={3}>
                                  {intl.get('ALARM_LEVEL_CRITICAL')}
                                </Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    )}
                    <Divider />
                  </div>
                ))}
              </>
            )}
          </Form.List>
          <Form.Item wrapperCol={{ offset: 3 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values: AlarmRule) => {
                  const final = {
                    ...values,
                    category: 2,
                    rules: values.rules.map((_rule) => ({
                      ..._rule,
                      threshold: Number(_rule.threshold),
                      description: _rule.description || ''
                    }))
                  };
                  updateAlarmRule(Number(id), final).then(() => navigate(`/alarmRules`));
                });
              }}
            >
              {intl.get('SAVE')}
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type='primary' onClick={() => navigate(-1)}>
              {intl.get('CANCEL')}
            </Button>
          </Form.Item>
        </Form>
      </ShadowCard>
    </>
  );
}
