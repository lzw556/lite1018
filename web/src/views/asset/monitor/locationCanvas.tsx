import {Circle, Group} from "react-konva";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";
import {Html} from "react-konva-utils";
import {Popover} from "antd";
import {Measurement} from "../../../types/measurement";
import {Asset} from "../../../types/asset";
import {FC, useState} from "react";
import moment from "moment";
import {MeasurementType} from "../../../types/measurement_type";

export interface LocationCanvasProps {
    x: number
    y: number
    value: Measurement | Asset
}

const LocationCanvas: FC<LocationCanvasProps> = ({x, y, value}) => {
    const [show, setShow] = useState<boolean>(false)

    const renderContent = () => {
        if (value as Measurement) {
            const measurement = value as Measurement
            if (measurement.data) {
                return <>
                    <p>{`类型: ${MeasurementType.toString(measurement.type)}`}</p>
                    {
                        Measurement.getPrimaryFields(measurement)?.map(field => {
                            return <>
                                <p>{`${field.title}: ${field.value}${field.unit}`}</p>
                            </>
                        })
                    }
                    <p>{`上报时间: ${moment.unix(measurement.data.timestamp).format("YYYY-MM-DD HH:mm:ss")}`}</p>
                </>
            }
        }
        const asset = value as Asset
        return <>
            <p>{`类型: 资产`}</p>
            {/*<p>{`状态: ${asset.status}`}</p>*/}
        </>
    }

    const getColor = () => {
        if (value as Measurement) {
            const measurement = value as Measurement
            switch (measurement?.alert?.level) {
                case 1:
                    return ColorInfo
                case 2:
                    return ColorWarn
                case 3:
                    return ColorDanger
                default:
                    return ColorHealth
            }
        }else {
            const asset = value as Asset
            return ColorHealth
        }
    }

    return <Group x={x} y={y}>
        <Circle radius={10}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndRadius={10}
                fillRadialGradientColorStops={[0, getColor(), 1, "transparent"]}
                onMouseOver={() => {
                    setShow(true)
                    window.document.body.style.cursor = "pointer";
                }}
                onMouseLeave={() => {
                    setShow(false)
                    window.document.body.style.cursor = "default";
                }}
        />
        <Html>
            <Popover visible={show} title={value.name} content={renderContent()}/>
        </Html>
    </Group>
}

export default LocationCanvas;