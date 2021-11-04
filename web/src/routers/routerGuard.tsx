import {Redirect, Route} from "react-router-dom";
import {isLogin} from "../utils/session";
import {GetParamValue} from "../utils/path";


const RouterGuard = (props: any) => {
    const {routes, location} = props;
    const {pathname} = location

    if (pathname === "/") {
        return <Redirect to={"/dashboard"}/>
    }

    const decodeLocation = () => {
        const locale = GetParamValue(location.search, "locale")
        if (locale) {
            return locale
        }
        return location.pathname
    }

    const match = (source: any, target: string) => {
        if (pathname === target) {
            const index = source.path.indexOf(":")
            if (index < 0) {
                return source.path === target
            }
            return source.path.substring(0, index) === target.substring(0, index)
        }
        return source.name === target
    }

    const target = routes.find((item: any) => match(item, decodeLocation()))
    if (target && !target.auth) {
        return <Route exact path={target.path} key={target.path} component={target.component}/>
    }

    if (isLogin()) {
        if (target) {
            return <Route exact path={target.path} key={target.path} component={target.component}/>
        } else {
            return <Redirect to="/404"/>
        }
    } else {
        return <Redirect to="/login"/>
    }
}

export default RouterGuard