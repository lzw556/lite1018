import {Button, Result, Space} from "antd";
import React from "react";

const UnauthorizedPage = () => {
    return <Result
        status="403"
        title="403"
        subTitle="对不起，你没有权限访问该页面，请联系管理员"
        extra={
            <Space>
                <Button type="default" onClick={() => {
                    window.location.hash = "/dashboard"
                }}>返回首页</Button>
                <Button type="primary" onClick={() => {
                    window.location.hash = "/login"
                }}>重新登录</Button>
            </Space>
        }
    />
};

export default UnauthorizedPage;