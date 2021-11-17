import {Breadcrumb, Col, Row} from "antd";
import {FC} from "react";

export interface MyBreadcrumbProps {
    items: any[]
    children?: any
}

const MyBreadcrumb:FC<MyBreadcrumbProps> = ({items,children}) => {

    return <Row justify={"space-between"} style={{paddingBottom: "8px"}}>
        <Col span={12}>
            <Breadcrumb style={{fontSize: "16pt", fontWeight: "bold"}}>
                {
                    items.map((item, index) => {
                        return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                    })
                }
            </Breadcrumb>
        </Col>
        <Col span={12} style={{textAlign: "right"}}>
            {
                children
            }
        </Col>
    </Row>
}

export default MyBreadcrumb;