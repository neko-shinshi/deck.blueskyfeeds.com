export interface UserData {
    did: string // UniqueId
    handle: string // Full Address
    displayName: string // Name
    avatar: string
    lastTs: number
}

export interface Account extends UserData {
    service: string
    active: boolean
}


export interface BlueskyAccount extends Account {
    service: string
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
    active: boolean
}

export interface MastodonAccount extends Account {
    email: string
    refreshJwt: string,
    accessJwt: string
}