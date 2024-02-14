export enum AccountType {
    MASTODON,
    BLUESKY
}

export type UserData = BlueskyUserData | MastodonUserData

export type MastodonUserData = {
    type:AccountType.MASTODON
    id: string // same as full address in Mastodon, did in Bluesky
    displayName: string // Name
    avatar: string
    lastTs: number
}

export type BlueskyUserData = {
    type:AccountType.BLUESKY
    id: string // did in Bluesky
    handle: string // Full Address
    displayName: string // Name
    avatar: string
    lastTs: number
}

export type EncryptedAccount = {
    id: string
    encryptedData: string
}

export enum AccountStateType {
    DISABLED=-2,
    FAILED=-1,
    PENDING=0,
    ACTIVE=1,
}
export type AccountState =
    {type:AccountStateType.FAILED, retries:number} |
    {type:AccountStateType.PENDING} |
    {type:AccountStateType.ACTIVE} |
    {type:AccountStateType.DISABLED}

export type AccountData = BlueskyAccount | MastodonAccount

export type BlueskyAccount = {
    type:AccountType.BLUESKY
    id: string
    service: string // connected server
    usernameOrEmail: string
    password: string
    refreshJwt: string
    accessJwt: string
    state: AccountState
}

export type MastodonAccount = {
    type:AccountType.MASTODON
    id: string
    token: string
    state: AccountState
}

export type AccountPair = {account:BlueskyAccount, user:BlueskyUserData} | {account:MastodonAccount, user:MastodonUserData}

export const getUserName = (user:UserData) => {
    if (!user) {return ""}
    return user.displayName || (user.type === AccountType.BLUESKY && user.handle) || "";
}