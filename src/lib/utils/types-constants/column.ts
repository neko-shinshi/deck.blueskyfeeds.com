import {NotificationType} from "@/lib/utils/types-constants/notification";
import {CwType} from "@/lib/utils/types-constants/content-warning";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumnailSize} from "@/lib/utils/types-constants/thumnail-size";

export interface PageOfColumns {
    name: string // for display
    columns: ColumnConfig[]
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
    id: string // uuid
    type: ColumnType
    active: boolean
    width: number
    columns: number
    refreshMs: RefreshTimingType
    thumbnailSize: ThumnailSize
}

interface ObservedColumn extends ColumnConfig {
    observer: string
}

export interface ColumnFirehose extends ColumnConfig {
    type: ColumnType.FIREHOSE,
    showReplies: boolean,
    keywords: string[]
    users: string[] // filter these users
    icon: string // base64 icon
}

export interface ColumnNotifications extends ColumnConfig {
    type: ColumnType.NOTIFS
    users: string[] // filter these signed-in users
    allowedTypes: NotificationType[]
}

export interface ColumnSearch extends ColumnConfig {
    type: ColumnType.SEARCH
    string: string // search this string
    icon: string // base64 icon
}

export interface ColumnHome extends ObservedColumn {
    type: ColumnType.HOME
}

export interface ColumnFeed extends ObservedColumn {
    type: ColumnType.FEED
    uri: string
}

export interface ColumnUsers extends ObservedColumn {
    type: ColumnType.USERS
    showReplies: boolean
    keywords: string[]
    uris: string[] // query these users
    icon: string // base64 icon
}

export interface ColumnMode {
    mode:"config"|"thread"|"profile"
    parent?: ColumnMode // All modes should parent all the way to root
}

// Look at a thread in detail
export interface ColumnThread extends ColumnMode {
    mode: "thread"
    uri: string // selected post, search back to root and show each child up to 2 levels down
}

// Look at a profile in detail
export interface ColumnProfile extends ColumnMode {
    mode: "profile"
    did: string // user's did
    viewer: string // default to the column did or the primary did, or blank
}

export const MIN_WIDTH = 10;
export const MAX_WIDTH = 40;