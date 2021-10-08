import {Layout} from "antd";
import "../../App.css";
import {useEffect} from "react";
import {store} from "../../store";
import {HeaderLayout} from "./index";

const {Content} = Layout

const DashboardLayout = (props: any) => {

    useEffect(() => {
        console.log(store.getState().auth.data)
    })

    return <Layout>
        <HeaderLayout hideConsole={false}/>
        <Content>
        </Content>
    </Layout>
}

export default DashboardLayout