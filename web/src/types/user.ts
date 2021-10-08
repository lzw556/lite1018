export type User = {
    id: number
    username: string
    email: string
    phone: string
    password: string
}

export const InitializeUserState: User = {
    id: 0,
    username: "",
    email: "",
    phone: "",
    password: "",
}