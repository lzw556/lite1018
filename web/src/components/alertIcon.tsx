import {Popover, Space, Spin, Tag, Typography} from "antd";
import {ColorDanger, ColorInfo, ColorWarn} from "../constants/color";
import {FC, useState} from "react";
import {TooltipPlacement} from "antd/lib/tooltip";
import {AlertState} from "../types/alert_state";
import {GetAlarmRecordRequest} from "../apis/alarm";
import moment from "moment";
import {GetFieldName} from "../constants/field";
import {OperationTranslate} from "../constants/rule";

export interface AlertIconProps {
    state: AlertState
    popoverPlacement: TooltipPlacement
}

const {Text} = Typography

const AlertIcon: FC<AlertIconProps> = ({state, popoverPlacement}) => {
    const [content, setContent] = useState<any>()

    const onShow = (visible: boolean) => {
        if (visible) {
            setContent(<Spin spinning={true}>loading...</Spin>)
            GetAlarmRecordRequest(state.record.id).then(res => {
                if (res.code === 200) {
                    setContent(<Space>
                        {
                            res.data.level == 3 && <Tag color={ColorDanger}>紧急</Tag>
                        }
                        {
                            res.data.level == 2 && <Tag color={ColorWarn}>重要</Tag>
                        }
                        {
                            res.data.level == 1 && <Tag color={ColorInfo}>提示</Tag>
                        }
                        <Text>{moment.unix(res.data.timestamp).local().format("YYYY-MM-DD HH:mm:ss")}</Text>
                        <Text>{`【${GetFieldName(res.data.rule.field)}】值${OperationTranslate(res.data.rule.operation)}设定的阈值${res.data.rule.threshold}${res.data.property.unit}`}</Text>
                    </Space>)
                }else {
                    setContent(<Text>{res.msg}</Text>)
                }
            })
        }
    }

    const renderAlertPopover = () => {
        if (state.level > 0) {
            let icon = "icon-info"
            let color = ColorInfo
            if (state.level === 2) {
                icon = "icon-warning"
                color = ColorWarn
            } else if (state.level === 3) {
                icon = "icon-critical"
                color = ColorDanger
            }
            return <Popover placement={popoverPlacement} content={content} onVisibleChange={onShow}>
                <span className={`iconfont ${icon}`} style={{color: color, cursor: "pointer"}}/>
            </Popover>
        }
        return null
    }

    return renderAlertPopover()
}
export default AlertIcon