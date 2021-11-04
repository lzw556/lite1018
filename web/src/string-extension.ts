String.prototype.macSeparator = function ():string {
    let str = String(this)
    if (str.length == 12) {
        return str.replace(/\w(?=(\w{2})+$)/g, "$&-")
    }
    return str
}

export {}