import {NotificationType} from "@/lib/utils/types-constants/notification";
import {CwType} from "@/lib/utils/types-constants/content-warning";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";
import {Post} from "@/lib/utils/types-constants/post";

export interface ProfileColumns {
    name: string // for display
    columnIds: string[]
    accountIds: string[]
    maskCw: boolean
    hideCw: boolean
    cwLabels: CwType[] // CwLabel type
    icon: string
}

export enum ColumnType {
    HOME = "Home",
    FEED = "Custom Feed",
    NOTIFS = "Notifications",
    USERS = "User List",
    SEARCH = "Search",
}

export interface ColumnConfig {
    id: string
    type: ColumnType
    name: string
    active: boolean

    // Use global defaults first
    width: number
    thumbnailSize: ThumbnailSize
    icon: string // custom base64 icon, otherwise use default or feed's default

    observers: string[]
}

export interface FetchedColumn {
    refreshMs: RefreshTimingType // Uses global default
}


export interface ColumnNotifications extends ColumnConfig, FetchedColumn {
    type: ColumnType.NOTIFS
    hideUsers: string[] // filter these signed-in users
    allowedTypes: NotificationType[]
}

export interface ColumnSearch extends ColumnConfig, FetchedColumn {
    type: ColumnType.SEARCH
    string: string // search this string
}

export interface ColumnHome extends ColumnConfig, FetchedColumn {
    type: ColumnType.HOME
}

export interface ColumnFeed extends ColumnConfig, FetchedColumn {
    type: ColumnType.FEED
    uri: string
}

export interface ColumnUsers extends ColumnConfig, FetchedColumn {
    type: ColumnType.USERS
    uri: string
}

export interface InColumn {
    id: string
    type: ColumnType
    name?: string
    observers: string[]
    icon?: string
}

export interface InHome extends InColumn {}

export interface InColumnFeed extends InColumn {
    type: ColumnType.FEED
    uri: string
}

export interface InColumnUsers extends InColumn {
    type: ColumnType.USERS
    uris: string // use a public or 'private' list
}


// Column Modes
export interface ColumnMode {
    id: string,
    mode:"settings"|"thread"|"profile"|"loading"
    parent?: ColumnMode // All modes should parent all the way to root
}

// Look at a thread in detail
export interface ColumnModeThread extends ColumnMode {
    mode: "thread"
    posts: Post[]
    mainUri: string
    viewer: string
}

// Look at a profile in detail
export interface ColumnModeProfile extends ColumnMode {
    mode: "profile"
    id: string // user's did
    viewer: string // default to the column id or blank
}

export interface ColumnModeLoading extends ColumnMode {
    mode: "loading"
    header: string
}

export const MIN_WIDTH = 20;
export const MAX_WIDTH = 50;