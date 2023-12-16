export interface UserData {
    // Store commonly referenced data, not full profile
    type: "m"|"b"
    id: string // same as full address in Mastodon, did in Bluesky
    handle: string // Full Address
    displayName: string // Name
    avatar: string
    lastTs: number
}

export interface MastodonUserData extends UserData {
    type:"m"
}

export interface BlueskyUserData extends UserData {
    type:"b"
}

export interface Account {
    active: boolean
}


export interface BlueskyAccount extends BlueskyUserData, Account {
    service: string // connected server
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
}

export interface MastodonAccount extends MastodonUserData, Account {
    token: string,
}

export const getUserName = (user:UserData) => {
    if (!user) {return ""}
    return user.displayName || user.handle;
}