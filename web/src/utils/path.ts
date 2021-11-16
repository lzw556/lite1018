
export function GetParamValue(search: string, key:string) {
    const index = search.indexOf("?")
    if (index >= 0) {
        const params = search.substring(index+1)
        const locale = params.split("&").find((item:string) => item.indexOf(key) >= 0)
        if (locale && locale.split("=").length === 2) {
            return locale.split("=")[1]
        }
    }
}