import {Layout} from "antd";
import "../../App.css";
import {FC, useEffect, useState} from "react";
import {store} from "../../store";
import {HeaderLayout} from "./index";

const {Content} = Layout
export interface DashboardLayoutProps {
    children: any
}

const DashboardLayout:FC<DashboardLayoutProps> = ({children}) => {
    const [height] = useState<number>(window.innerHeight)

    useEffect(() => {
        console.log(store.getState().auth.data)
    }, [])

    return <Layout style={{height: `${height}px`}}>
        <HeaderLayout hideConsole={false}/>
        <Content style={{position:"relative", left:0, right:0, backgroundColor:"#eef0f5"}}>
            {children}
        </Content>
    </Layout>
}

export default DashboardLayout