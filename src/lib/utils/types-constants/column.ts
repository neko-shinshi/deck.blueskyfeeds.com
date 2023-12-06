import {NotificationType} from "@/lib/utils/types-constants/notification";
import {CwType} from "@/lib/utils/types-constants/content-warning";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";
import {Post} from "@/lib/utils/types-constants/post";

export interface PageOfColumns {
    name: string // for display
    columns: string[]
    maskCw: boolean
    hideCw: boolean
    cwLabels: CwType[] // CwLabel type
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
    icon: string // base64 icon
}

export interface FetchedColumn {
    refreshMs: RefreshTimingType // Uses global default
}

export interface ObservedColumn {
    observer: string
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

export interface ColumnHome extends ColumnConfig, ObservedColumn, FetchedColumn {
    type: ColumnType.HOME
}

export interface ColumnFeed extends ColumnConfig, ObservedColumn, FetchedColumn {
    type: ColumnType.FEED
    uri: string
}

export interface ColumnUsers extends ColumnConfig, ObservedColumn, FetchedColumn {
    type: ColumnType.USERS
    uri: string
    showReplies: boolean
    keywords: string[]
}

export interface InColumn {
    id: string
    type: ColumnType,
    name: string
}

export interface InHome extends InColumn {
    observer: string
}

export interface InColumnFeed extends InColumn {
    type: ColumnType.FEED
    uri: string
}

export interface InColumnUsers extends InColumn {
    type: ColumnType.USERS
    uris: string[] // query these users
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
}

// Look at a profile in detail
export interface ColumnModeProfile extends ColumnMode {
    mode: "profile"
    id: string // user's did
    viewer: string // default to the column id or the primary id, or blank
}

export interface ColumnModeLoading extends ColumnMode {
    mode: "loading"
    header: string
}

export const MIN_WIDTH = 10;
export const MAX_WIDTH = 40;