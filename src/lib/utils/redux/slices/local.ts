import { createSlice } from '@reduxjs/toolkit'
import {PopupConfig} from "@/lib/utils/types-constants/popup";
import {store} from "@/lib/utils/redux/store";
export type LocalState = {
    currentPage: string,
    popupConfig: PopupConfig
}

// Local data is not shared, and is volatile
const initialState:LocalState = {currentPage:"", popupConfig: false};

const slice = createSlice({
    name:"local",
    initialState,
    reducers:{
        setPage: (state, action) => {
            const {pageId} = action.payload;
            state.currentPage = pageId;
        },
        _setPopupConfig: (state, action) => {
            const {popupConfig} = action.payload;
            state.popupConfig = popupConfig;
        },
    }
});
export const { setPage, _setPopupConfig } = slice.actions

export const setPopupConfig = (popupConfig:PopupConfig) => {
    store.dispatch(_setPopupConfig({popupConfig}));
}
export default slice.reducer