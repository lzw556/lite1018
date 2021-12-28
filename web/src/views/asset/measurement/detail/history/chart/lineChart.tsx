import EChartsReact from "echarts-for-react";
import {FC, useCallback, useEffect, useState} from "react";
import moment from "moment";
import {DefaultHistoryDataOption, LineChartStyles} from "../../../../../../constants/chart";
import {MeasurementChartProps} from "./measurement_chart";
import {MeasurementFieldType} from "../../../../../../types/measurement_data";

const LineChart:FC<MeasurementChartProps> = ({dataSource, field, style}) => {
    const [option, setOption] = useState<any>({})

    const convertOption = useCallback(() => {
        if (dataSource) {
            const times = dataSource.map((item:any) => moment.unix(item.timestamp).local());
            let legend: any[] = []
            let series = {}
            if (field.type === MeasurementFieldType.Float) {
                legend = [field.title]
                series =  [{
                    ...LineChartStyles[0],
                    name: field.title,
                    type: "line",
                    data: dataSource.map((item:any) => item.fields.find((item:any) => item.name === field.name).value),
                }]
            }else {
                legend = ["X轴", "Y轴", "Z轴"]
                const data = dataSource.map((item: any) => item.fields.find((item: any) => item.name === field.name).value)
                series = data[0]?.map((items: number[], index: number) => {
                    return data.map((values:any) => values[index])
                }).map((item:any, index:number) => {
                    return {
                        ...LineChartStyles[index],
                        name: legend[index],
                        type: "line",
                        data: item,
                    }
                })
            }
            setOption({
                ...DefaultHistoryDataOption,
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params: any) {
                        let relVal = params[0].name;
                        for (let i = 0; i < params.length; i++) {
                            let value = Number(params[i].value).toFixed(3)
                            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${field?.unit}`
                        }
                        return relVal;
                    }
                },
                series: series,
                legend: {data: legend},
                title: {text: field.title},
                xAxis:[{
                    type: 'category',
                    boundaryGap: false,
                    data: times.map((time:any) => time.format("YYYY-MM-DD HH:mm:ss"))
                }]
            })
        }else {
            setOption({})
        }
    }, [field])

    useEffect(() => {
        convertOption()
    }, [convertOption])

    return <EChartsReact option={option} style={style} notMerge={true}/>
}

export default LineChart;