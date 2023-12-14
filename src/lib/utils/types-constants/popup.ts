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

export interface PopupConfig {
    state: PopupState,
}

export interface PopupConfigManageColumn extends PopupConfig {
    state: PopupState.MANAGE_COLUMN,
    id: string
}

export interface PopupConfigUsers extends PopupConfig {
    state: PopupState.USERS,
    title: string
}

export interface PopupConfigPostAction extends PopupConfig {
    state: PopupState.POST_ACTION,
    uri: string
}