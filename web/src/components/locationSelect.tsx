import {Col, Modal, Row, Select, Tag, Typography} from "antd";
import {FC, useState} from "react";
import useImage from "use-image";
import {Circle, Group, Image, Layer, Stage} from "react-konva";
import {ColorDanger} from "../constants/color";

export interface LocationPickUpProps {
    width: number;
    height: number;
    title?: string;
    placeholder?: string;
    description?: string;
    background: string
    defaultValue?: { x: number, y: number };
    onChange?: (point?: { x: number, y: number }) => void;
}

const LocationSelect: FC<LocationPickUpProps> = ({
                                                     defaultValue,
                                                     width,
                                                     height,
                                                     background,
                                                     title,
                                                     placeholder,
                                                     description,
                                                     onChange
                                                 }) => {
    const [image, status] = useImage(`/api/resources/assets/${background}`);
    const [visible, setVisible] = useState<boolean>(false);
    const [point, setPoint] = useState(defaultValue);

    const onOk = () => {
        setVisible(false);
        if (onChange) {
            onChange(point);
        }
    }

    const onCancel = () => {
        setPoint(undefined)
        setVisible(false);
    }

    const renderImage = () => {
        if (status === "loaded" && image) {
            const scale = width / image.width;
            const x = (width - image.width * scale) / 2;
            const y = (height - image.height * scale) / 2;
            return <Group x={x} y={y} width={image.width * scale} height={image.height * scale}>
                <Image width={image.width * scale} height={image.height * scale} image={image} onClick={evt => {
                    const offsetX = ((evt.evt.offsetX - x) / (image.width * scale)).toFixed(6)
                    const offsetY = ((evt.evt.offsetY - y) / (image.height * scale)).toFixed(6)
                    setPoint({x: parseFloat(offsetX), y: parseFloat(offsetY)})
                }}/>
                {
                    point &&
                    <Circle x={point.x * image.width * scale} y={point.y * image.height * scale}
                            radius={5}
                            fillRadialGradientStartRadius={0}
                            fillRadialGradientEndRadius={5}
                            fillRadialGradientColorStops={[0, ColorDanger, 1, "transparent"]}
                    />
                }
            </Group>
        }
    }

    return <>
        <Select
            placeholder={placeholder}
            mode={"multiple"}
            onFocus={() => setVisible(true)}
            open={false}
            value={point && [point.x, point.y]}
            allowClear={true}
            tagRender={(props) => {
                const {value} = props;
                return <Tag {...props} closable={false}>{
                    point && point.x === value ? `X轴坐标:${value}` : `Y轴坐标:${value}`
                }</Tag>
            }}
            ref={select => {
                select?.blur()
            }}
            onClear={() => {
                setPoint(undefined)
            }}
        />
        <Modal title={title} visible={visible} width={450} okText={"确定"} cancelText={"取消"} onOk={onOk}
               onCancel={onCancel}>
            <Typography.Title level={5}>{description}</Typography.Title>
            <Stage width={width} height={height}>
                <Layer>
                    {
                        renderImage()
                    }
                </Layer>
            </Stage>
            {
                point && <Row justify={"center"} style={{textAlign: "center"}}>
                    <Col span={12}>
                        {`X轴坐标: ${point.x}`}
                    </Col>
                    <Col span={12}>
                        {`Y轴坐标: ${point.y}`}
                    </Col>
                </Row>
            }
        </Modal>
    </>
}

export default LocationSelect;