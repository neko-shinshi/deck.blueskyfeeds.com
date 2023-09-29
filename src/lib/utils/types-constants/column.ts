import {NotificationType} from "@/lib/utils/types-constants/notification";
import {CwType} from "@/lib/utils/types-constants/content-warning";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumnailSize} from "@/lib/utils/types-constants/thumnail-size";

export interface PageColumn {
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