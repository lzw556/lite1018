import {Button, Col, Row, Space} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {useState} from "react";
import {useLocation} from "react-router-dom";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";
import HasPermission from "../../permission";
import {Permission} from "../../permission/permission";
import {GetParamValue} from "../../utils/path";
import AlarmRule from "./rule";
import AlarmRuleTemplate from "./template";


const tabList = [
    {
        key: "rules",
        tab: "规则列表",
    },
    {
        key: "templates",
        tab: "规则模板",
    }
]

const contents = new Map<string, any>([
    ["rules", <AlarmRule/>],
    ["templates", <AlarmRuleTemplate/>]
])

const AlarmPage = () => {
    const location = useLocation<any>()
    const tab = GetParamValue(location.search, "tab")
    const [currentKey, setCurrentKey] = useState<string>(tab ? tab : "rules")

    const renderAddButton = () => {
        if (currentKey === "rules") {
            return <HasPermission value={Permission.AlarmAdd}>
                <Button href="#/alarm-management?locale=alarmRules/addAlarmRule" type="primary">
                    创建规则 <PlusOutlined/>
                </Button>
            </HasPermission>
        } else if (currentKey === "templates") {
            return <HasPermission value={Permission.AlarmTemplateAdd}>
                <Button href="#/alarm-management?locale=alarmRules/addAlarmRuleTemplate" type="primary">
                    创建规则模板 <PlusOutlined/>
                </Button>
            </HasPermission>
        }
    }

    return <Content>
        <MyBreadcrumb>
            <Space>
                {
                    renderAddButton()
                }
            </Space>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                <ShadowCard tabList={tabList} activeTabKey={currentKey} size={"small"} onTabChange={key => {
                    setCurrentKey(key)
                }}>
                    {contents.get(currentKey)}
                </ShadowCard>
            </Col>
        </Row>
    </Content>
}

export default AlarmPage