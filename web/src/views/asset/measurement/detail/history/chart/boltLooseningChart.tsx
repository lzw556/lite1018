import EChartsReact from "echarts-for-react";
import {FC} from "react";
import moment from "moment";
import {DefaultHistoryDataOption, LineChartStyles} from "../../../../../../constants/chart";
import {MeasurementChartProps} from "./measurement_chart";

const BoltLooseningChart:FC<MeasurementChartProps> = ({dataSource, field, style}) => {

    const convertOptions = () => {
        if (dataSource) {
            const times = dataSource.map((item:any) => moment.unix(item.timestamp).local());
            const values = dataSource.map((item:any) => item.fields.find((item:any) => item.name === field.name).value);
            return {
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
                series: [{
                    ...LineChartStyles[0],
                    name: field.title,
                    type: 'line',
                    data: values,
                }],
                legend: {data: [field.title]},
                title: {text: field.title},
                xAxis:[{
                    type: 'category',
                    boundaryGap: false,
                    data: times.map((time:any) => time.format("YYYY-MM-DD HH:mm:ss"))
                }]
            }
        }
        return {}
    }

    return <EChartsReact option={convertOptions()} style={style}/>
}

export default BoltLooseningChart