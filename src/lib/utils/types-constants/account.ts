export interface Account {
    // Update all of this via post information
    did: string
    handle: string
    displayName: string
    avatar: string
    lastTs: number // also update this when updating lastFetchTs if less
    postsCount: number
    followsCount: number
    followersCount: number
}

export enum UserStatusType {
    ACTIVE="ACTIVE", LOGGED_OUT="LOGGED_OUT", RATE_LIMITED="RATE_LIMITED"
}


export interface UserData extends Account {
    service: string
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
    status: UserStatusType
}