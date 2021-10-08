import {Form} from "antd"
import "./index.css"
import {FC} from "react";

export interface LabelProps {
    name?: string
}

const Label: FC<LabelProps> = ({name, children}) => {
    return <Form.Item label={name} className="ts-border" style={{margin: "auto", height: "32px"}}>
        {children}
    </Form.Item>
}

export default Label