export enum AccountType {
    self = "Self",
}

export interface UserData {
    // Update all of this via post information
    did: string
    handle: string
    displayName: string
    avatar: string

    lastTs: number
    postsCount: number
    followsCount: number
    followersCount: number
}



export interface Account extends UserData {
    service: string
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
    active: boolean
}