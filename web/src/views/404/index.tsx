import {FC} from "react";
import {Button, Result} from "antd";

const NotFoundPage: FC = () => {
    return  <Result
        status="404"
        title="404"
        subTitle="对不起，您访问的页面不存在"
        extra={<Button type="primary" onClick={() => {
            window.location.hash = "/"
        }}>返回首页</Button>}
    />
}

export default NotFoundPage