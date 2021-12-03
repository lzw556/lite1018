import {AddAlarmRuleTemplateRequest} from "../../../../apis/alarm";
import RuleTemplate from "./ruleTemplate";


const AddRuleTemplatePage = () => {

    const onSave = (value: any) => {
        AddAlarmRuleTemplateRequest(value)
            .then(_ => {
                window.location.hash = "alarm-management?locale=alarmRules&tab=templates"
            })
    }

    return <RuleTemplate onOk={onSave} okText={"创建"}/>
}

export default AddRuleTemplatePage