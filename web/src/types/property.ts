export type Property = {
    id: number
    name: string
    unit: string
    fields: Field[]
}

export type Field = {
    name: string
}

export const InitializeProperty = {
    id: 0,
    name: "",
    unit: "",
    fields: [],
}