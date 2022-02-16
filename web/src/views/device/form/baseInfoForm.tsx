import {CheckMacAddressRequest} from "../../../apis/device";
import {useState} from "react";


const BaseInfoForm = (props: any) => {
    const {form} = props
    const [network, setNetwork] = useState<number>()

    const onMacValidator = (rule:any, value:any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入MAC地址")
            }
            if (value.length !== 12) {
                reject("请输入正确的MAC地址")
                return
            }
            CheckMacAddressRequest(value).then(
                resolve
            ).catch(_ => {
                reject("MAC地址已存在")
            })
        })
    }

    return
}

export default BaseInfoForm