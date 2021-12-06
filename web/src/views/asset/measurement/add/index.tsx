import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../../components/myBreadcrumb";
import ShadowCard from "../../../../components/shadowCard";
import {Col, Form, Input, Row, Steps} from "antd";
import {Rules} from "../../../../constants/validator";
import MeasurementTypeSelect from "../../../../components/measurementTypeSelect";
import AssetSelect from "../../../../components/assetSelect";
import {useState} from "react";
import BaseInfoFormItem from "./baseInfoFormItem";

const {Step} = Steps;

const AddMeasurement = () => {
    const [current, setCurrent] = useState<number>(0)
    const steps = [
        {
            title: "基本信息",
        },
        {
            title: "关联设备",
        }
    ]

    return <Content>
        <MyBreadcrumb/>
        <ShadowCard>
            <Row justify={"start"}>
                <Col span={12}>
                    <Form labelCol={{span: 6}}>
                        <Steps
                            current={current}
                            className="site-navigation-steps"
                            type="navigation"
                            size="small">
                            {
                                steps.map(item => <Step key={item.title} title={item.title}/>)
                            }
                        </Steps>
                        {
                            current === 0 && <BaseInfoFormItem />
                        }
                    </Form>
                </Col>
            </Row>
        </ShadowCard>
    </Content>
}

export default AddMeasurement;