import {Redirect, Route} from "react-router-dom";
import {isLogin} from "../utils/session";


const RouterGuard = (props: any) => {
    const {routes, location} = props;
    const {pathname} = location

    if (pathname === "/") {
        return <Redirect to="/dashboard"/>
    }

    const target = routes.find((item:any) => item.path === pathname)
    if (target && !target.auth) {
        return <Route strict path={target.path} key={target.path} component={target.component}/>
    }

    if (isLogin()) {
        if (target) {
            return <Route strict path={target.path} key={target.path} component={target.component}/>
        } else {
            return <Redirect to="/404"/>
        }
    }else {
        return <Redirect to="/login"/>
    }
}

export default RouterGuard