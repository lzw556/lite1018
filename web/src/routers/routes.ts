import {
    AddDevice,
    Asset,
    Device,
    Firmware, HistoryData,
    ImportNetwork,
    Login,
    Me,
    Network,
    NotFound,
    ServerError,
    User
} from "../views";
import {
    AppstoreOutlined,
    ClusterOutlined,
    DashboardOutlined,
    FolderOutlined, LineChartOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";

const AppRoutes = [
    {
        path: "/login",
        name: "Login",
        component: Login,
        auth: false
    },
    {
        path: "/404",
        name: "404",
        component: NotFound,
        auth: false
    },
    {
        path: "/500",
        name: "500",
        component: ServerError,
        auth: false,
    }
]

const ConsoleRoutes = [
    {
        name: "dashboard",
        path: "/dashboard",
        title: "监控大屏",
        icon: DashboardOutlined,
    },
    {
        name: "asset-management",
        path: "/asset-management",
        title: "资产管理",
        icon: FolderOutlined,
        children: [
            {
                name: "assets",
                path: "/asset-management/assets",
                title: "资产列表",
                component: Asset,
                auth: false,
            },
        ],
    },
    {
        name: "device-management",
        path: "/device-management",
        title: "设备管理",
        icon: AppstoreOutlined,
        children: [
            {
                name: "devices",
                path: "/device-management/devices",
                title: "设备列表",
                component: Device,
                auth: false,
            },
            {
                name: "add",
                path: "/device-management/add",
                title: "添加设备",
                component: AddDevice,
                auth: false,
            },
            {
                name: "firmwares",
                path: "/device-management/firmwares",
                title: "固件列表",
                component: Firmware,
                auth: false,
            }
        ]
    },
    {
        name: "network-management",
        path: "/network-management",
        title: "网络管理",
        icon: ClusterOutlined,
        children: [
            {
                name: "networks",
                path: "/network-management/networks",
                title: "网络列表",
                component: Network,
                auth: false,
            },
            {
                name: "import",
                path: "/network-management/import",
                title: "导入网络",
                component: ImportNetwork,
                auth: false
            }
        ]
    },
    {
        name: "data-management",
        path: "/data-management",
        title: "数据管理",
        icon: LineChartOutlined,
        children: [
            {
                name: "history",
                path: "/data-management/history",
                title: "历史数据",
                component: HistoryData,
                auth: false
            }
        ]
    },
    {
        name: "user-management",
        path: "/user-management",
        title: "用户管理",
        component: User,
        auth: false,
        icon: TeamOutlined,
    },
    {
        name: "me",
        path: "/me",
        title: "个人中心",
        component: Me,
        auth: false,
        icon: UserOutlined
    }
]

export {
    AppRoutes,
    ConsoleRoutes
}