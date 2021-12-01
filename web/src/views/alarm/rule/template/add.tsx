import {AddAlarmRuleTemplateRequest} from "../../../../apis/alarm";
import RuleTemplate from "./ruleTemplate";
import {useHistory} from "react-router-dom";


const AddRuleTemplatePage = () => {

    const history = useHistory()

    const onSave = (value: any) => {
        AddAlarmRuleTemplateRequest(value)
            .then(_ => {
                history.push({pathname: "/alarm-management?locale=alarmRules", state: {tab: "templates"}})
            })
    }

    return <RuleTemplate onOk={onSave} okText={"创建"}/>
}

export default AddRuleTemplatePage