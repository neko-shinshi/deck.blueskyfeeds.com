import {NotificationType} from "@/lib/utils/types-constants/notification";
import {CwType} from "@/lib/utils/types-constants/content-warning";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumnailSize} from "@/lib/utils/types-constants/thumnail-size";

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
    FIREHOSE = "Firehose"
}

export interface ColumnConfig {
    id: string
    type: ColumnType
    name: string
    active: boolean
    columns: number

    // Use global defaults first
    width: number
    thumbnailSize: ThumnailSize
    icon: string // base64 icon
}

export interface FetchedColumn {
    refreshMs: RefreshTimingType // Uses global default
}

export interface ObservedColumn {
    observer: string
}

export interface ColumnFirehose extends ColumnConfig {
    type: ColumnType.FIREHOSE,
    showReplies: boolean,
    keywords: string[]
    users: string[] // filter these users
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
    uris: string[] // query these users
    showReplies: boolean
    keywords: string[]
}

export interface InColumn {
    id: string
    type: ColumnType
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
    mode:"config"|"thread"|"profile"
    parent?: ColumnMode // All modes should parent all the way to root
}

// Look at a thread in detail
export interface ColumnModeThread extends ColumnMode {
    mode: "thread"
    uri: string // selected post, search back to root and show each child up to 2 levels down
}

// Look at a profile in detail
export interface ColumnModeProfile extends ColumnMode {
    mode: "profile"
    did: string // user's did
    viewer: string // default to the column did or the primary did, or blank
}

export const MIN_WIDTH = 10;
export const MAX_WIDTH = 40;