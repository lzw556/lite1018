import {FC, useEffect, useState} from "react";
import EChartsReact from "echarts-for-react";
import {GetAlarmRecordStatisticsRequest} from "../../../../apis/alarm";
import moment from "moment";
import {AlarmLevelCritical, AlarmLevelInfo, AlarmLevelWarn} from "../../../../constants/rule";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../../constants/color";
import {DefaultMultiBarOption} from "../../../../constants/chart";

export interface AlertStatisticProps {
    filter: any;
    style?: any;
}

const AlertStatistic:FC<AlertStatisticProps> = ({filter,style}) => {
    const [option, setOption] = useState<any>({})
    const [beginDate] = useState(moment().subtract(7, "days").startOf("d"))
    const [endDate] = useState(moment().endOf("d"))

    useEffect(() => {
        if (filter) {
            GetAlarmRecordStatisticsRequest(beginDate.utc().unix(), endDate.utc().unix(), filter).then(convertChartOption)
        }
    }, [filter])

    const convertChartOption = (data:any) => {
        const {info, warn, critical, time} = data
        const series = [
            {name: AlarmLevelInfo, type: "bar", data: info, color: ColorInfo},
            {name: AlarmLevelWarn, type: "bar", data: warn, color: ColorWarn},
            {name: AlarmLevelCritical, type: "bar", data: critical, color: ColorDanger},
        ]
        setOption({
            ...DefaultMultiBarOption,
            xAxis: {
                ...DefaultMultiBarOption.xAxis,
                data: time.map((item:any) => moment.unix(item).local().format("MM/DD"))
            },
            yAxis: {
              minInterval: 1,
            },
            series: series
        })
    }

    return <EChartsReact option={option} style={style}/>
}

export default AlertStatistic;