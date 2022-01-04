import {Asset} from "../../../types/asset";
import React, {FC, useEffect, useState} from "react";
import {GetMeasurementStatisticsRequest} from "../../../apis/measurement";
import EChartsReact from "echarts-for-react";
import {DefaultPieOption} from "../../../constants/chart";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";

export interface MeasurementStatisticProps {
    asset?: Asset;
    style?: React.CSSProperties;
}

const MeasurementStatistic: FC<MeasurementStatisticProps> = ({asset, style}) => {
    const [option, setOption] = useState<any>({});

    useEffect(() => {
        if (asset) {
            GetMeasurementStatisticsRequest(asset.id).then(convertChartOption);
        }
    }, [asset])

    const convertChartOption = (data: any) => {
        const normal = data.filter((item:any) => item.status === 0).length
        const info = data.filter((item:any) => item.status === 1).length
        const warning = data.filter((item:any) => item.status === 2).length
        const critical = data.filter((item:any) => item.status === 3).length
        const legend = new Map<string, number>([
            ['正常', normal],
            ['提示', info],
            ['重要', warning],
            ['紧急', critical],
        ]);
        setOption({
            ...DefaultPieOption,
            legend: {
                show: true,
                orient: 'vertical',
                top: 0,
                left: 0,
                formatter: function (name: string) {
                    return `${name}(${legend.get(name)})`;
                },
            },
            graphic: [],
            series: [
                {
                    ...DefaultPieOption.series[0],
                    radius: ['50%', '80%'],
                    center: ['70%', '45%'],
                    name: '设备状态',
                    data: [
                        {
                            value: normal,
                            name: '正常',
                            itemStyle: {
                                color: ColorHealth
                            }
                        },
                        {
                            value: info,
                            name: '提示',
                            itemStyle: {
                                color: ColorInfo
                            },
                        },
                        {
                            value: warning,
                            name: '重要',
                            itemStyle: {
                                color: ColorWarn
                            }
                        },
                        {
                            value: critical,
                            name: '紧急',
                            itemStyle: {
                                color: ColorDanger
                            }
                        },
                    ]
                }
            ]
        })
    }

    return <EChartsReact option={option} style={style}/>
}

export default MeasurementStatistic