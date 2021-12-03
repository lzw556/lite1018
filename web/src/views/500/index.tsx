import {FC} from 'react';
import {Button, Result} from "antd";

const ServerErrorPage: FC = () => {
    return <Result
        status="500"
        title="500"
        subTitle="对不起，服务器出错了"
        extra={<Button type="primary" onClick={() => {
            window.location.hash = "/"
        }}>返回首页</Button>}
    />
}

export default ServerErrorPage