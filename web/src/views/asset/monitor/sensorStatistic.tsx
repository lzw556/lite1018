import {FC, useEffect, useState} from "react";
import {GetDevicesStatisticsRequest} from "../../../apis/device";
import {DefaultPieOption} from "../../../constants/chart";
import {ColorHealth, ColorWarn} from "../../../constants/color";
import EChartsReact from "echarts-for-react";
import {DeviceStatistic} from "../../../types/device_statistic";

export interface DeviceStatisticProps {
    filter?: any
    style?: any
}

const SensorStatistic: FC<DeviceStatisticProps> = ({filter,style}) => {
    const [option, setOption] = useState<any>({});

    useEffect(() => {
        GetDevicesStatisticsRequest(filter).then(convertChartOption)
    }, [filter])

    const convertChartOption = (data: DeviceStatistic[]) => {
        const offline = data.filter(item => item.status === 0 && item.device.category === 3).length
        const online = data.filter((item: any) => item.status === 1 && item.device.category === 3).length
        const legend = new Map<string, number>([
            ['在线', online],
            ['离线', offline],
        ]);
        setOption({
            ...DefaultPieOption,
            legend: {
                show: true,
                orient: 'vertical',
                top: '10%',
                left: 0,
                formatter: function (name: string) {
                    return `${name}(${legend.get(name)})`;
                },
            },
            series: [
                {
                    ...DefaultPieOption.series[0],
                    radius: ['50%', '80%'],
                    center: ['70%', '45%'],
                    name: '传感器状态',
                    data: [
                        {
                            value: online,
                            name: '在线',
                            itemStyle: {
                                color: ColorHealth
                            }
                        },
                        {
                            value: offline,
                            name: '离线',
                            itemStyle: {
                                color: ColorWarn
                            }
                        },
                    ]
                }
            ]
        })
    }

    return <EChartsReact option={option} style={style}/>
}

export default SensorStatistic;