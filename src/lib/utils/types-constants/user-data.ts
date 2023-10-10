export interface UserData {
    did: string
    handle: string
    displayName: string
    avatar: string
    lastTs: number
}



export interface Account extends UserData {
    service: string
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
    active: boolean
}