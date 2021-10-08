import {Button, Empty} from "antd"
import "../../App.css";

export interface EmptyLayoutProps {
    description: string
    buttonText: string
    onClick?:() => void
}

const EmptyLayout = (props: EmptyLayoutProps) => {
    const {description, buttonText, onClick} = props
    return <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{
            height: 60,
        }}
        description={
            <p>
                {description}
            </p>
        }
    >
        <Button type="primary" onClick={onClick}>{buttonText}</Button>
    </Empty>
}

export default EmptyLayout