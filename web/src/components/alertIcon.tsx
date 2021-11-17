import {Popover, Space, Tag, Typography} from "antd";
import {ColorDanger, ColorInfo, ColorWarn} from "../constants/color";
import {FC} from "react";
import {GetFieldName} from "../constants/field";
import {TooltipPlacement} from "antd/lib/tooltip";
import moment from "moment";
import {AlertState} from "../types/alert_state";

export interface AlertIconProps {
    state: AlertState
    popoverPlacement: TooltipPlacement
}

const {Text} = Typography

const AlertIcon: FC<AlertIconProps> = ({state, popoverPlacement}) => {

    const renderContent = (level:string, state:any, color:any) => {
        console.log(state.alarm.field)
        return <Space>
            <Tag color={color}>{level}</Tag>
            <Text>{moment.unix(state.timestamp).local().format("YYYY-MM-DD HH:mm:ss")}</Text>
            <Text>{state.content.replace(state.alarm.field, GetFieldName(state.alarm.field))}</Text>
        </Space>
    }

    const renderAlertPopover = () => {
        if (state.level > 0) {
            let icon = "icon-info"
            let color = ColorInfo
            let level = "提示"
            if (state.level === 2) {
                icon = "icon-warning"
                color = ColorWarn
                level = "重要"
            }else if (state.level === 3) {
                icon = "icon-critical"
                color = ColorDanger
                level = "紧急"
            }
            return <Popover placement={popoverPlacement} content={renderContent(level, state, color)}>
                <span className={`iconfont ${icon}`} style={{color: color, cursor: "pointer"}}/>
            </Popover>
        }
        return null
    }

    return renderAlertPopover()
}
export default AlertIcon