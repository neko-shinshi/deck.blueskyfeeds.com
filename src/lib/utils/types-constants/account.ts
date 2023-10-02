export interface Account {
    // Update all of this via post information
    did: string
    handle: string
    displayName: string
    avatar: string
    lastTs: number

    // Fetched data (if scroll into view prefetch all user info)
    postCount: number
    followingCount: number
    followerCount: number
    lastFetchTs: number
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