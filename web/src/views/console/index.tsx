import React, {useEffect, useState} from "react";
import {ConsoleLayout} from "../layout";
import {GetMyMenusRequest} from "../../apis/menu";
import {Menu} from "../../types/menu";
import {isLogin} from "../../utils/session";
import {Spin} from "antd";
import {useDispatch} from "redux-react-hook";
import {setMenusAction} from "../../store/actions/getMenusSuccess";

const ConsolePage = (props: any) => {
    const [menus, setMenus] = useState<Menu[]>()
    const dispatch = useDispatch()

    useEffect(() => {
        if (isLogin()) {
            GetMyMenusRequest().then(data => {
                setMenus(data)
                dispatch(setMenusAction(data))
            })
        } else {
            window.location.hash = "/login"
        }
    }, [])

    const render = () => {
        if (menus !== undefined) {
            return <ConsoleLayout {...props} menus={menus}/>
        }
        return <div style={{position: "absolute", width: "100%", height: "100%", textAlign: "center"}}>
            <Spin size={"large"} tip={"加载中..."} spinning={true} style={{position: "absolute", paddingTop: "25%"}}/>
        </div>
    }

    return render()
}

export default ConsolePage