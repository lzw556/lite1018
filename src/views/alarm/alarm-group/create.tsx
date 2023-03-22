import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Cascader, Col, Divider, Form, Input, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/pageTitle';
import ShadowCard from '../../../components/shadowCard';
import { defaultValidateMessages } from '../../../constants/validator';
import { isMobile } from '../../../utils/deviceDetection';
import { getPropertiesByMeasurementType } from './services';
import { AlarmRule } from './types';
import { addAlarmRule } from './services';
import {
  MONITORING_POINT_TYPE,
  PLEASE_SELECT_MONITORING_POINT_TYPE,
  Property,
  getSpecificProperties,
  removeDulpicateProperties
} from '../../monitoring-point';
import { useAssetCategoryContext } from '../../asset/components/assetCategoryContext';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';
import intl from 'react-intl-universal';

export default function CreateAlarmRuleGroup() {
  const navigate = useNavigate();
  const category = useAssetCategoryContext();
  const [form] = Form.useForm();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [metric, setMetric] = React.useState<{ key: string; name: string; unit: string }[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const [smallSize, setSmallSize] = React.useState(window.innerWidth < 1500);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => setSmallSize(window.innerWidth < 1500));
  }, []);

  return (
    <>
      <PageTitle
        items={[
          { title: <Link to='/alarmRules'>{intl.get('ALARM_RULES')}</Link> },
          { title: intl.get('CREATE_ALARM_RULE') }
        ]}
      />
      <ShadowCard>
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 18 }}
          validateMessages={defaultValidateMessages}
        >
          <Form.Item
            label={intl.get(MONITORING_POINT_TYPE)}
            name='type'
            rules={[{ required: true, message: intl.get(PLEASE_SELECT_MONITORING_POINT_TYPE) }]}
          >
            <Select
              style={{ width: isMobile ? '75%' : 435 }}
              placeholder={intl.get(PLEASE_SELECT_MONITORING_POINT_TYPE)}
              onChange={(e) => {
                getPropertiesByMeasurementType(e).then((res) => {
                  const measurementType = MONITORING_POINTS.get(category)?.find(
                    ({ id }) => e === id
                  )?.id;
                  if (measurementType) {
                    setDisabled(false);
                    setProperties(
                      removeDulpicateProperties(getSpecificProperties(res, measurementType))
                    );
                  }
                });
                const formData: AlarmRule['rules'] = form.getFieldValue('rules');
                if (formData && formData.length > 0) {
                  form.setFieldsValue(
                    formData.map((field) => {
                      delete field.index;
                      return field;
                    })
                  );
                }
              }}
            >
              {MONITORING_POINTS.get(category)?.map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {intl.get(label)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <FormInputItem
            name='name'
            label={intl.get('NAME')}
            requiredMessage={intl.get('PLEASE_INPUT_NAME')}
            lengthLimit={{ min: 4, max: 16, label: intl.get('NAME').toLowerCase() }}
          >
            <Input
              placeholder={intl.get('PLEASE_INPUT_NAME')}
              style={{ width: isMobile ? '75%' : 435 }}
            />
          </FormInputItem>
          <Form.Item label={intl.get('DESCRIPTION')} name='description' initialValue=''>
            <Input
              placeholder={intl.get('PLEASE_INPUT_DESCRIPTION')}
              style={{ width: isMobile ? '75%' : 435 }}
            />
          </Form.Item>
          <Divider />
          <Form.List name='rules' initialValue={[0]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restFields }, index) => (
                  <div key={key} style={{ position: 'relative' }}>
                    {!smallSize && (
                      <>
                        <FormInputItem
                          label={intl.get('NAME')}
                          {...restFields}
                          name={[name, 'name']}
                          dependencies={index === 0 ? undefined : ['user', index - 1, 'name']}
                          requiredMessage={intl.get('PLEASE_INPUT_NAME')}
                          lengthLimit={{
                            min: 4,
                            max: 16,
                            label: intl.get('NAME').toLowerCase()
                          }}
                        >
                          <Input
                            placeholder={intl.get('PLEASE_INPUT_NAME')}
                            style={{ width: isMobile ? '75%' : 435 }}
                          />
                        </FormInputItem>
                        <Row>
                          {properties && properties.length > 0 && (
                            <Col xl={6} offset={1}>
                              <Form.Item
                                labelCol={{ span: 8 }}
                                {...restFields}
                                name={[name, 'index']}
                                label={intl.get('INDEX')}
                                rules={[
                                  { required: true, message: intl.get('PLEASE_SELECT_INDEX_NAME') }
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Cascader
                                  disabled={disabled}
                                  style={{ width: '100%' }}
                                  popupClassName='alarm-rule-creation-cascader'
                                  onChange={(e, selectOptions) => {
                                    if (e !== undefined) {
                                      const property = properties.find(({ key }) => key === e[0]);
                                      if (property) {
                                        const selected = e.length === 1 ? [...e, ...e] : e;
                                        const metric = {
                                          key: selected.join('.'),
                                          name: selectOptions.map(({ name }) => name).join(':'),
                                          unit: property.unit
                                        };
                                        setMetric((prev) => {
                                          if (prev.length === 0) {
                                            return [metric];
                                          } else if (prev.length < index + 1) {
                                            return [...prev, metric];
                                          } else {
                                            return prev.map((item, n) => {
                                              if (n === index) {
                                                return metric;
                                              } else {
                                                return item;
                                              }
                                            });
                                          }
                                        });
                                      }
                                    }
                                  }}
                                  options={properties.map((p) => ({
                                    ...p,
                                    name: intl.get(p.name)
                                  }))}
                                  fieldNames={{ label: 'name', value: 'key', children: 'fields' }}
                                />
                              </Form.Item>
                            </Col>
                          )}
                          <Col xl={6} offset={properties.length === 0 ? 1 : 0}>
                            <FormInputItem
                              labelCol={{ span: 8 }}
                              label={intl.get('DURATION')}
                              {...restFields}
                              name={[name, 'duration']}
                              requiredMessage={intl.get('PLEASE_INPUT_SOMETHING', {
                                something: intl.get('DURATION')
                              })}
                              numericRule={{
                                isInteger: true,
                                min: 1,
                                message: intl.get('UNSIGNED_INTEGER_INPUT_PROMPT')
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
                              requiredMessage={intl.get('PLEASE_INPUT_SOMETHING', {
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
                                    metric.length > 0 && metric[index] ? metric[index].unit : ''
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
                                  {intl.get('ALARM_LEVEL_INFO')}
                                </Select.Option>
                                <Select.Option key={2} value={2}>
                                  {intl.get('ALARM_LEVEL_WARN')}
                                </Select.Option>
                                <Select.Option key={3} value={3}>
                                  {intl.get('ALARM_LEVEL_DANGER')}
                                </Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    )}
                    {smallSize && (
                      <>
                        <FormInputItem
                          label={intl.get('NAME')}
                          {...restFields}
                          name={[name, 'name']}
                          dependencies={index === 0 ? undefined : ['user', index - 1, 'name']}
                          requiredMessage={intl.get('PLEASE_INPUT_NAME')}
                          lengthLimit={{
                            min: 4,
                            max: 16,
                            label: intl.get('NAME').toLowerCase()
                          }}
                        >
                          <Input
                            placeholder={intl.get('PLEASE_INPUT_NAME')}
                            style={{ width: isMobile ? '75%' : 435 }}
                          />
                        </FormInputItem>
                        {properties && properties.length > 0 && (
                          <Form.Item
                            {...restFields}
                            name={[name, 'index']}
                            label={intl.get('INDEX')}
                            rules={[
                              { required: true, message: intl.get('PLEASE_SELECT_INDEX_NAME') }
                            ]}
                          >
                            <Cascader
                              disabled={disabled}
                              popupClassName='alarm-rule-creation-cascader'
                              style={{ width: isMobile ? '75%' : 435 }}
                              onChange={(e, selectOptions) => {
                                if (e !== undefined) {
                                  const property = properties.find(({ key }) => key === e[0]);
                                  if (property) {
                                    const selected = e.length === 1 ? [...e, ...e] : e;
                                    const metric = {
                                      key: selected.join('.'),
                                      name: selectOptions.map(({ name }) => name).join(':'),
                                      unit: property.unit
                                    };
                                    setMetric((prev) => {
                                      if (prev.length === 0) {
                                        return [metric];
                                      } else if (prev.length < index + 1) {
                                        return [...prev, metric];
                                      } else {
                                        return prev.map((item, n) => {
                                          if (n === index) {
                                            return metric;
                                          } else {
                                            return item;
                                          }
                                        });
                                      }
                                    });
                                  }
                                }
                              }}
                              options={properties.map((p) => ({ ...p, name: intl.get(p.name) }))}
                              fieldNames={{ label: 'name', value: 'key', children: 'fields' }}
                            />
                          </Form.Item>
                        )}
                        <FormInputItem
                          label={intl.get('DURATION')}
                          {...restFields}
                          name={[name, 'duration']}
                          requiredMessage={intl.get('PLEASE_INPUT_SOMETHING', {
                            something: intl.get('DURATION')
                          })}
                          numericRule={{
                            isInteger: true,
                            min: 1,
                            message: intl.get('UNSIGNED_INTEGER_INPUT_PROMPT')
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
                          requiredMessage={intl.get('PLEASE_INPUT_SOMETHING', {
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
                                metric.length > 0 && metric[index] ? metric[index].unit : ''
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
                              {intl.get('ALARM_LEVEL_INFO')}
                            </Select.Option>
                            <Select.Option key={2} value={2}>
                              {intl.get('ALARM_LEVEL_WARN')}
                            </Select.Option>
                            <Select.Option key={3} value={3}>
                              {intl.get('ALARM_LEVEL_DANGER')}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </>
                    )}
                    {name !== 0 && (
                      <Button
                        icon={<MinusCircleOutlined />}
                        style={{ position: 'absolute', top: 0 }}
                        onClick={() => remove(name)}
                      />
                    )}
                    <Divider />
                  </div>
                ))}
                <Form.Item wrapperCol={{ offset: 2 }}>
                  <Button onClick={() => add()}>{intl.get('CREATE_ALARM_RULE')}</Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item wrapperCol={{ offset: 2 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values: AlarmRule) => {
                  const final = {
                    ...values,
                    category: 2,
                    rules: values.rules.map((rule, index) => {
                      delete rule.index;
                      return {
                        ...rule,
                        duration: Number(rule.duration),
                        threshold: Number(rule.threshold),
                        metric: metric[index]
                      };
                    })
                  };
                  addAlarmRule(final).then(() => navigate(`/alarmRules`));
                });
              }}
            >
              {intl.get('CREATE')}
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
