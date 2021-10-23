import {Button, Col, Row, Space} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {useState} from "react";
import {useLocation} from "react-router-dom";
import RulesPage from "./list";
import RuleTemplatesPage from "./template";
import ShadowCard from "../../../components/shadowCard";


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
    ["rules", <RulesPage />],
    ["templates", <RuleTemplatesPage />]
])

const AlarmRulePage = () => {
    const location = useLocation<any>()
    const [currentKey, setCurrentKey] = useState<string>(location.state && location.state.tab ? location.state.tab : "rules")

    const renderAddButton = () => {
        if (currentKey === "rules") {
            return <Button href="#/alarm-management/alarmRules?locale=addRule" type="primary">
                添加规则 <PlusOutlined/>
            </Button>
        }else if (currentKey === "templates") {
            return <Button href= "#/alarm-management/alarmRules?locale=addRuleTemplate" type="primary">
                创建规则模板 <PlusOutlined/>
            </Button>
        }
    }

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
                <Space>
                    {
                        renderAddButton()
                    }
                </Space>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "15px"}}>
                    <ShadowCard tabList={tabList} activeTabKey={currentKey} size={"small"} onTabChange={key => {
                        setCurrentKey(key)
                    }}>
                        {contents.get(currentKey)}
                    </ShadowCard>
                </Content>
            </Col>
        </Row>
    </div>
}

export default AlarmRulePage