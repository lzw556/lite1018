import React, {FC, useEffect, useState} from 'react';
import {useHistory} from "react-router-dom";
import {Button, Col, Form, Input, message, Row, Space, Typography} from 'antd';
import {LoginRequest} from "../../apis/user";
import logo from '../../assets/images/logo-dark.png';
import ad from '../../assets/images/login-ad-dark.png';
import '../../App.css';
import './login.css';
import {userLoginSuccess} from "../../store/actions/userLoginSuccess";
import {useDispatch} from "redux-react-hook";
import {persistor} from "../../store";
import {KeyOutlined, UserOutlined} from "@ant-design/icons";

const LoginPage: FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const dispatch = useDispatch()
    const history = useHistory()
    
    const login = (values: any) => {
        setIsLoading(true)
        LoginRequest(values.username, values.password).then((res) => {
            setIsLoading(false)
            if (res.code === 200) {
                message.success("登录成功").then()
                dispatch(userLoginSuccess(res.data))
                history.push('/')
            }else {
                message.error(res.msg).then()
            }
        })
    }

    useEffect(() => {
        persistor.purge().then()
    })

    return <div id="login-page">
        <Row justify="center" align="bottom" className="logo">
            <Col span={18} offset={4}>
                <Space size={48}>
                    <img src={logo} alt="ThetaSensors"/>
                    <Typography.Text strong className="title">云监控平台</Typography.Text>
                </Space>
            </Col>
        </Row>
        <br/>
        <br/>
        <Row justify="center" align="bottom">
            <Col span={16} offset={6}>
                <img src={ad} alt="Theta"/>
            </Col>
        </Row>
        <br/>
        <Row justify="center" align="bottom">
            <Col span={18} className="split-line"/>
        </Row>
        <Form onFinish={login}>
            <Row justify="space-between">
                <Col span={4}/>
                <Col span={4}>
                    <Form.Item name="username" rules={[{required: true, message: '请输入用户名'}]}>
                        <Input prefix={<UserOutlined />} placeholder="用户名"/>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="password" rules={[{required: true, message: '请输入密码'}]}>
                        <Input prefix={<KeyOutlined />} placeholder="密码" type="password"/>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isLoading}>登 录</Button>
                    </Form.Item>
                </Col>
                <Col span={4}/>
            </Row>
        </Form>
    </div>
}

export default LoginPage