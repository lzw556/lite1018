import { Form, Input, Row, Col, Button } from 'antd'
import * as React from 'react'
import { UpdateDeviceRequest } from '../../../../apis/device'
import { defaultValidateMessages, Rules } from '../../../../constants/validator'
import { Device } from '../../../../types/device'

export const BasicSettings: React.FC<{ device: Device; onUpdate: (name: string) => void; }> = ({ device, onUpdate }) => {
  const [isloading, setIsLoading] = React.useState(false)
  const [form] = Form.useForm();
  React.useEffect(() => { form.setFieldsValue({ name: device.name }); }, [])

  return (
    <>
      <Row justify={'start'}>
        <Col xxl={8} xl={10} xs={24}>
          <Form
            form={form}
            labelCol={{ xl: 7, xxl: 6 }}
            validateMessages={defaultValidateMessages}
          >
            <Form.Item
              label={'设备名称'}
              name={'name'}
              rules={[Rules.range(4, 20)]}
            >
              <Input placeholder={'请输入设备名称'} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row justify={'start'}>
        <Col xl={10} xxl={8} xs={24}>
          <Row justify={'end'}>
            <Col>
              <Button type={'primary'} loading={isloading} onClick={() => {
                form.validateFields().then(values => {
                  setIsLoading(true)
                  UpdateDeviceRequest(device.id, values.name).then(_ => {
                    setIsLoading(false);
                    onUpdate(values.name);
                  })
                })
              }}>
                保存
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}
