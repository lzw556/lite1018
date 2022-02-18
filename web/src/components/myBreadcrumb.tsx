import {Breadcrumb, Col, Row} from "antd";
import {FC, useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {GetParamValue} from "../utils/path";
import {getMenus} from "../utils/session";
import {SecondaryRoutes} from "../routers/routes";

export interface MyBreadcrumbProps {
    children?: any
    label?: string
}

const flattenRoutes: any = (children: any) => {
    return children.reduce((acc: any, curr: any) => {
        acc.push(curr)
        return acc.concat(curr.children ? flattenRoutes(curr.children) : [])
    }, [])
}

const routes = flattenRoutes(getMenus()).concat(SecondaryRoutes)

const MyBreadcrumb:FC<MyBreadcrumbProps> = ({children, label}) => {
    const location = useLocation()
    const history = useHistory()
    const locale = GetParamValue(location.search, "locale")
    const [items, setItems] = useState([])

    useEffect(() => {
        setItems(routes.filter((route:any) => locale?.split("/").includes(route.name)))
    }, [])

    return <Row justify={"space-between"} style={{paddingBottom: "8px"}}>
        <Col span={12}>
            <Breadcrumb style={{fontSize: "16pt", fontWeight: "bold"}}>
                {
                    items.map((route:any, index:number) => {
                        if (items.length-1 === index) {
                            return <Breadcrumb.Item key={index}>{label ? label : route.title}</Breadcrumb.Item>
                        }
                        return <a onClick={() => history.go(index - items.length + 1)}>
                            <Breadcrumb.Item key={index}>{route.title}</Breadcrumb.Item>
                        </a>
                    })
                }
            </Breadcrumb>
        </Col>
        <Col span={12}>
            <Row justify={"end"}>
                <Col>
                    {
                        children
                    }
                </Col>
            </Row>
        </Col>
    </Row>
}

export default MyBreadcrumb;