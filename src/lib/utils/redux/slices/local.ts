import { createSlice } from '@reduxjs/toolkit'
import {PopupConfig} from "@/lib/utils/types-constants/popup";
import {store} from "@/lib/utils/redux/store";
export type LocalState = {
    currentProfile: string,
    popupConfig: PopupConfig
}

// Local data is volatile and not synced nor persisted
const initialState:LocalState = {currentProfile:"", popupConfig: false};

const slice = createSlice({
    name:"local",
    initialState,
    reducers:{
        setCurrentProfile: (state, action) => {
            const {profileId} = action.payload;
            state.currentProfile = profileId;
        },
        _setPopupConfig: (state, action) => {
            const {popupConfig} = action.payload;
            state.popupConfig = popupConfig;
        },
        resetLocal: (state, action) => {
            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value;
            }
        }
    }
});
export const { resetLocal, setCurrentProfile, _setPopupConfig } = slice.actions

// The dispatch wrapper is handled here
export const setPopupConfig = (popupConfig:PopupConfig) => {
    store.dispatch(_setPopupConfig({popupConfig}));
}
export default slice.reducer