import {Form} from "antd"
import "./index.css"
import {FC} from "react";

export interface LabelProps {
    name?: string
    width?: number
}

const Label: FC<LabelProps> = ({name, width, children}) => {
    return <Form.Item label={name} className="ts-border" style={{margin: "auto", height: "32px", width}}>
        {children}
    </Form.Item>
}

export default Label