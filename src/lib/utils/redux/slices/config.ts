import {createSlice} from '@reduxjs/toolkit'
import {FontSize} from "@/lib/utils/types-constants/font-size";
import {ColorMode} from "@/lib/utils/types-constants/color-mode";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumnailSize} from "@/lib/utils/types-constants/thumnail-size";

interface Config {
    started: boolean
    colorMode: ColorMode
    showScrollbars: boolean
    altTextPrompt: boolean
    offsetLeft: boolean // align to left or to avatar
    fontSize: FontSize
    primaryDid: string
    basicKey: string
    columnWidth: number
    refreshMs: RefreshTimingType
    thumbnailSize: ThumnailSize
}

export const initialState:Config = {
    started:false,

    // Globals
    colorMode: ColorMode.DARK,
    showScrollbars: true,
    altTextPrompt: true,
    offsetLeft: true,
    fontSize: FontSize.Medium,
    primaryDid: "",
    basicKey: "",

    // Globals Defaults
    columnWidth: 21,
    refreshMs: RefreshTimingType["1m"],
    thumbnailSize: ThumnailSize.LARGE
};

const slice = createSlice({
    name:"config",
    initialState,
    reducers:{
        startApp: (state) => {
            state.started = true;
        },

        setConfigValue: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                if (key !== "__terminate") {
                    state[key] = value;
                }
            }
        },
        resetConfig: (state, action) => {
            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value;
            }
        }
    }
});

export const {startApp, setConfigValue, resetConfig} = slice.actions
export default slice.reducer