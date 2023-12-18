import {Post} from "@/lib/utils/types-constants/post";

export enum PopupState {
    LOGIN,
    USERS,
    ADD_COLUMN,
    MANAGE_COLUMN,
    SETTINGS,
    NEW_POST,
    SEARCH,
    POST_ACTION,
    PICK_PAGE,
    MEDIA_GALLERY
}

export type PopupConfig = PopupConfigManageColumn | PopupConfigUsers | PopupConfigPostAction | {state: PopupState} | false

export type PopupConfigManageColumn = {
    state: PopupState.MANAGE_COLUMN,
    id: string
}

export type PopupConfigUsers = {
    state: PopupState.USERS,
    title: string
}

export type PopupConfigPostAction = {
    state: PopupState.POST_ACTION,
    uri: string
}