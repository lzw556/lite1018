import RuleTemplate from "./ruleTemplate";
import {useHistory, useLocation} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {GetRuleTemplateRequest, UpdateRuleTemplateRequest} from "../../../../apis/alarm";
import {AlarmRuleTemplate} from "../../../../types/alarm_rule_template";
import {message} from "antd";
import {GetParamValue} from "../../../../utils/path";

const EditRuleTemplatePage = () => {
    const location = useLocation<any>()
    const [template, setTemplate] = useState<AlarmRuleTemplate>()
    const history = useHistory()

    const fetchTemplate = useCallback(() => {
        const templateId = GetParamValue(location.search, "templateId")
        if (templateId && !!Number(templateId)) {
            GetRuleTemplateRequest(Number(templateId))
                .then(data => setTemplate(data))
                .catch(_ => {
                    history.push({pathname: "/alarm-management/alarmRules", state: {tab: "templates"}})
                })
        }else {
            message.error("模板不存在").then()
            history.push({pathname: "/alarm-management/alarmRules", state: {tab: "templates"}})
        }
    }, [])

    useEffect(() => {
        fetchTemplate()
    }, [fetchTemplate])

    const onSave = (value: any) => {
        UpdateRuleTemplateRequest(value.id, value)
            .then(_ => {
                history.push({pathname: "/alarm-management/alarmRules", state: {tab: "templates"}})
            })
    }

    const render = () => {
        if (template) {
            return <RuleTemplate defaultValue={template} onOk={onSave} okText={"保存"}/>
        }
        return <div/>
    }
    return render()
}
export default EditRuleTemplatePage