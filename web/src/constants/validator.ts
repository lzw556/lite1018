const typeTemplate = "'${name}' is not a valid ${type}"

export const defaultValidateMessages = {
    default: "Validation error on field '${name}'",
    required: "输入不能为空",
    enum: "'${name}' must be one of [${enum}]",
    whitespace: "输入不能为空",
    date: {
        format: "日期格式错误",
        parse: "日期格式错误",
        invalid: "无效的日期",
    },
    types: {
        string: typeTemplate,
        method: typeTemplate,
        array: typeTemplate,
        object: typeTemplate,
        number: "输入值不是有效数值",
        date: typeTemplate,
        boolean: typeTemplate,
        integer: "输入值不是有效数值",
        float: "输入值不是有效数值",
        regexp: typeTemplate,
        email: typeTemplate,
        url: typeTemplate,
        hex: typeTemplate,
    },
    string: {
        len: "'${name}' must be exactly ${len} characters",
        min: "'${name}' must be at least ${min} characters",
        max: "'${name}' cannot be longer than ${max} characters",
        range: "'${label}' must be between ${min} and ${max} characters",
    },
    number: {
        len: "'${name}' must equal ${len}",
        min: "'${name}' cannot be less than ${min}",
        max: "'${name}' cannot be greater than ${max}",
        range: "${label}范围必须在 ${min} 到 ${max}",
    },
    array: {
        len: "'${name}' must be exactly ${len} in length",
        min: "'${name}' cannot be less than ${min} in length",
        max: "'${name}' cannot be greater than ${max} in length",
        range: "'${name}' must be between ${min} and ${max} in length",
    },
    pattern: {
        mismatch: "'${name}' does not match pattern ${pattern}",
    },
};


export const Rules = {
    required: () => {
        return {required: true}
    },
    range: (min: number, max: number) => {
        return {required: true, min, max, message: `请输入${min}到${max}个字符`}
    },
    number: (): any => {
        return {
            required: true, type: "number", transform(value: number) {
                if (value) {
                    return Number(value)
                }
                return value
            }
        }
    },
    float: (): any => {
        return {
            required: true, type: "float", transform(value: any) {
                if (value) {
                    return parseFloat(value)
                }
                return value
            }
        }
    },
    macAddress: (): any => {
        return {
            required: true, transform(value: any) {
                return value
            }, pattern: /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/,
            message: "MAC地址格式不正确"
        }
    }
}

export const Normalizes = {
    float: (value: any) => {
        if (value) {
            return parseFloat(value)
        }
        return value
    },
    number: (value: any) => {
        if (value) {
            return Number(value)
        }
        return value
    },
    macAddress: (value: string) => {
        if (value) {
            return value.toLowerCase().replaceAll("-", "");
        }
    },
    seconds: (value:number) => {
        if (value) {
            return value / 1000
        }
    }
}