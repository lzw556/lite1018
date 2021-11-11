import ShadowCard from "../../../components/shadowCard";
import {Typography} from "antd";
import {useEffect, useState} from "react";
import {GetAlarmStatisticsRequest} from "../../../apis/alarm";
import {AlarmLevelCritical, AlarmLevelInfo, AlarmLevelWarn} from "../../../constants/rule";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../constants/color";
import {DefaultMultiBarOption} from "../../../constants/chart";
import moment from "moment";
import EChartsReact from "echarts-for-react";

const {Title} = Typography;

const AlertStatistics = () => {
    const [option, setOption] = useState<any>()
    const [beginTime] = useState(moment().local().startOf("day").subtract(7, 'd'))
    const [endTime] = useState(moment().local().endOf("day"))

    useEffect(() => {
        GetAlarmStatisticsRequest(beginTime.utc().unix(), endTime.utc().unix(), {}).then(res => {
            if (res.code === 200) {
                const {info, warn, critical} = res.data
                const time = []
                for (let i = 0; i < 7; i++) {
                    time.push(moment(beginTime).local().add(i+1, "d"))
                }
                const series = [
                    {name: AlarmLevelInfo, type: "bar", data: info, color: ColorInfo},
                    {name: AlarmLevelWarn, type: "bar", data: warn, color: ColorWarn},
                    {name: AlarmLevelCritical, type: "bar", data: critical, color: ColorDanger},
                ]
                setOption({
                    ...DefaultMultiBarOption,
                    xAxis: {
                        ...DefaultMultiBarOption.xAxis,
                        data: time.map(item => item.format("MM/DD"))
                    },
                    series: series
                })
            }
        })
    }, [])

    return <ShadowCard style={{margin: 4}}>
        <Title level={4}>一周报警统计</Title>
        {
            option && <EChartsReact option={option} style={{height: "212px"}}/>
        }
    </ShadowCard>
}

export default AlertStatistics