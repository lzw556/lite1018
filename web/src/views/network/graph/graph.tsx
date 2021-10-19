import {Canvas, Edge, Node, NodeProps, Remove} from "reaflow";
import "./graph.css"
import {FC} from "react";
import {Device} from "../../../types/device";
import {DeviceType} from "../../../types/device_type";

interface INode {
    id: string
    text: string
    data: {
        device: Device
    }
}

interface IEdge {
    id: string
    from: string
    to: string
}

export interface GraphProps {
    data: { nodes: INode[], edges: IEdge[] }
    height: number
    selections: string[]
    onClick?: (device: Device) => void
    onHover?: (x: number, y: number, device: Device) => void
    onLeave?: () => void
    onRemove?: (device: Device) => void
}

const Graph: FC<GraphProps> = ({data, selections, height, onClick, onHover, onLeave, onRemove}) => {

    const renderEdge = (props: any) => {
        const node = data.nodes.find(n => n.data.device.macAddress === props.target)
        if (node && node.data.device.status && node.data.device.status.isOnline) {
            return <Edge style={{stroke: "#28A745", fill: "#28A745"}}/>
        }
        return <Edge style={{stroke: "#FFC107", fill: "#FFC107"}}/>
    }

    return <div className="ts-graph" style={{height: `${height - 56}px`}}>
        <Canvas fit={true} selections={selections} nodes={data.nodes} edges={data.edges}
                direction="RIGHT"
                node={(props: NodeProps) => (
                    <Node
                        onClick={(event, node) => {
                            if (onClick) {
                                onClick(node.data.device)
                            }
                        }}
                        onEnter={(event, node) => {
                            if (onHover) {
                                onHover(event.clientX, event.clientY + props.height, node.data.device)
                            }
                        }}
                        onLeave={(event, node) => {
                            if (onLeave) {
                                onLeave()
                            }
                        }}
                        remove={<Remove x={props.width / 2} y={props.height}
                                        hidden={props.properties.data.device.typeId === DeviceType.Gateway}/>}
                        onRemove={(event, node) => {
                            if (onRemove) {
                                onRemove(node.data.device)
                            }
                        }}
                    />
                )}
                edge={(props) => (
                    renderEdge(props)
                )}
        />
    </div>
}

export default Graph