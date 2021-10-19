import {message} from "antd";
import {AddAlarmRuleTemplateRequest} from "../../../../apis/alarm";
import RuleTemplate from "./ruleTemplate";
import {useHistory} from "react-router-dom";


const AddRuleTemplatePage = () => {

    const history = useHistory()

    const onSave = (value:any) => {
        AddAlarmRuleTemplateRequest(value).then(res => {
            if (res.code === 200) {
                message.success("模板创建成功").then()
                history.push({pathname: "/alarm-management/alarmRules", state: {tab: "templates"}})
            }else {
                message.error(`模板创建失败`).then()
            }
        })
    }

    return <RuleTemplate onOk={onSave} okText={"创建"}/>
}

export default AddRuleTemplatePage