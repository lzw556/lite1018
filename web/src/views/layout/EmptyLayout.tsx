import {Empty, EmptyProps} from "antd"
import "../../App.css";

export interface EmptyLayoutProps extends EmptyProps{
    description: string
}

const EmptyLayout = (props: EmptyLayoutProps) => {
    const {description, children} = props
    return <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
            <p>
                {description}
            </p>
        }
    >
        {children}
    </Empty>
}

export default EmptyLayout