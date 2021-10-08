import {Card} from "antd";
import useSocket from "../../socket";

const data = {
    "nodes": [
        {
            "id": "1",
            "text": "node1"
        },
        {
            "id": "2",
            "text": "node2"
        }
    ],
    "edges": [
        {
            id: "1",
            from: "1",
            to: "2"
        }
    ]
}

const MePage = () => {
    const {connectionState} = useSocket()

    const render = () => {
        if (connectionState) {
            if (connectionState.isOnline) {
                return <div>在线</div>
            }
        }
        return <div>离线</div>
    }

    return <Card title={"测试"}>
        {
            render()
        }
    </Card>
}

export default MePage