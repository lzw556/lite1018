import {Card, Col, Form, Input, message, Row} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useEffect, useState} from "react";
import EditPassModal from "./edit/editPassModal";
import "./index.css";
import {GetMyProfile, UpdateMyProfile} from "../../apis/profile";
import {User} from "../../types/user";

const MePage = () => {
    const [isPhoneEdit, setIsPhoneEdit] = useState<boolean>(false)
    const [isEmailEdit, setIsEmailEdit] = useState<boolean>(false)
    const [isPassEdit, setIsPassEdit] = useState<boolean>(false)
    const [user, setUser] = useState<User>()
    const [form] = Form.useForm()

    useEffect(() => {
        GetMyProfile().then(res => {
            if (res.code === 200) {
                setUser(res.data)
            }
        })
    }, [])

    const renderPhone = () => {
        if (isPhoneEdit) {
            return <Form.Item name={"phone"} initialValue={user?.phone} rules={[{type: "number"}]}>
                <Input size="small"/>
            </Form.Item>
        } else {
            return user && user.phone.length ? user.phone : "尚未绑定"
        }
    }

    const onSavePhone = () => {
        form.validateFields(["phone"]).then(values => {
            UpdateMyProfile({phone: values.phone}).then(res => {
                if (res.code === 200) {
                    message.success("保存成功").then()
                    setUser(res.data)
                } else {
                    message.error("保存失败").then()
                }
                setIsPhoneEdit(false)
            })
        })
    }

    const renderEmail = () => {
        if (isEmailEdit) {
            return <Form.Item name={"email"} initialValue={user?.email} rules={[{type: "email"}]}>
                <Input size="small"/>
            </Form.Item>
        } else {
            return user && user.email.length ? user.email : "尚未绑定"
        }
    }

    const onSaveEmail = () => {
        form.validateFields(["email"]).then(values => {
            UpdateMyProfile({email: values.email}).then(res => {
                if (res.code === 200) {
                    message.success("保存成功").then()
                    setUser(res.data)
                } else {
                    message.error("保存失败").then()
                }
                setIsEmailEdit(false)
            })
        })
    }

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "35px"}}>
                    <Card title="基本信息" bordered={false}>
                        <Form form={form}>
                            <p>
                                <Row justify={"start"}>
                                    <Col span={2} className="ts-label">
                                        账号名
                                    </Col>
                                    <Col span={5}>
                                        {
                                            user?.username
                                        }
                                    </Col>
                                    <Col span={2}>

                                    </Col>
                                </Row>
                            </p>
                            <p>
                                <Row justify={"start"}>
                                    <Col span={2} className="ts-label">
                                        手机号
                                    </Col>
                                    <Col span={5}>
                                        {
                                            renderPhone()
                                        }
                                    </Col>
                                    <Col span={2} offset={1}>
                                        {
                                            isPhoneEdit ? (<a onClick={onSavePhone}>保存</a>) : (
                                                <a onClick={() => setIsPhoneEdit(true)}>修改</a>)
                                        }
                                    </Col>
                                </Row>
                            </p>
                            <p>
                                <Row justify={"start"}>
                                    <Col span={2} className="ts-label">
                                        邮箱地址
                                    </Col>
                                    <Col span={5}>
                                        {
                                            renderEmail()
                                        }
                                    </Col>
                                    <Col span={2} offset={1}>
                                        {
                                            isEmailEdit ? (<a onClick={onSaveEmail}>保存</a>) : (
                                                <a onClick={() => setIsEmailEdit(true)}>修改</a>)
                                        }
                                    </Col>
                                </Row>
                            </p>
                        </Form>
                    </Card>
                    <br/>
                    <Card title="账号安全" bordered={false}>
                        <Row justify={"start"}>
                            <Col span={2} className="ts-label">
                                密码
                            </Col>
                            <Col span={5}>
                                ********
                            </Col>
                            <Col span={2} offset={1}>
                                <a onClick={() => setIsPassEdit(true)}>修改</a>
                            </Col>
                        </Row>
                    </Card>
                </Content>
            </Col>
        </Row>
        <EditPassModal visible={isPassEdit} onSuccess={() => {
            setIsPassEdit(false)
        }} onCancel={() => {
            setIsPassEdit(false)
        }}/>
    </div>
}

export default MePage