import {FC, useEffect, useState} from "react";
import {Group, Image, Layer, Stage} from "react-konva";
import useImage from "use-image";
import {Asset} from "../../../types/asset";
import {Measurement} from "../../../types/measurement";
import {GetAssetChildrenRequest} from "../../../apis/asset";
import LocationCanvas from "./locationCanvas";
import {Col, Row, Skeleton, Spin} from "antd";

export interface AssetCanvasProps {
    width: number;
    height?: number;
    center?: number | undefined
    middle?: number | undefined
    measurements: Measurement[];
    asset: Asset;
}

const AssetCanvas: FC<AssetCanvasProps> = ({width, asset, measurements}) => {
    const [image, status] = useImage(`/api/resources/assets/${asset.image}`);
    const [children, setChildren] = useState<Asset[]>([])

    useEffect(() => {
        GetAssetChildrenRequest(asset.id).then(setChildren)
    }, [asset])

    const render = () => {
        switch (status) {
            case "loading":
                return <Row justify={"center"} align={"middle"} style={{height: "200px"}}>
                    <Col>
                        <Spin spinning tip={"图片加载中..."}/>
                    </Col>
                </Row>
            case "loaded":
                if (image) {
                    const scale = width / image.width;
                    const scaleWidth = image.width * scale;
                    const scaleHeight = image.height * scale;
                    const x = (width - scaleWidth) / 2;
                    return <Stage key={`${asset.id}-stage`} width={width} height={scaleHeight} draggable={true}>
                        <Layer>
                            <Group key={`${asset.id}-group`} x={x} y={0} width={scaleWidth} height={scaleHeight}>
                                <Image key={`${asset.id}-image`} width={scaleWidth} height={scaleHeight} image={image}/>
                                {
                                    renderMeasurements(scaleWidth, scaleHeight)
                                }
                                {
                                    renderAssetChildren(scaleWidth, scaleHeight)
                                }
                            </Group>
                        </Layer>
                    </Stage>
                }
                return <div>
                    没有图片
                </div>
            case "failed":
                return <Row justify={"center"} align={"middle"} style={{height: "200px"}}>
                    <Col>
                        <Skeleton.Image/>
                    </Col>
                </Row>
            default:
                return <div/>
        }
    }

    const renderMeasurements = (width: number, height: number) => {
        return measurements.filter(item => item.display).map((measurement: any) => {
            return <LocationCanvas key={`${measurement.id}-measurement`}
                                   x={width * measurement.display.location.x}
                                   y={height * measurement.display.location.y}
                                   value={measurement}/>
        })
    }

    const renderAssetChildren = (width: number, height: number) => {
        return children.filter(item => item.display).map((child: any) => {
            return <LocationCanvas key={`${child.id}-asset`}
                                   x={width * child.display.location.x}
                                   y={height * child.display.location.y}
                                   value={child}/>
        })
    }

    return render()
}

export default AssetCanvas