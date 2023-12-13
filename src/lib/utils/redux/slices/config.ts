import {createSlice} from '@reduxjs/toolkit'
import {FontSize} from "@/lib/utils/types-constants/font-size";
import {ColorMode} from "@/lib/utils/types-constants/color-mode";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";

interface Config {
    colorMode: ColorMode
    showScrollbars: boolean
    altTextPrompt: boolean
    offsetLeft: boolean // align to left or to avatar
    fontSize: FontSize
    basicKey: string
    columnWidth: number
    refreshMs: RefreshTimingType
    thumbnailSize: ThumbnailSize
    showTags: boolean
    version: number
}

export const initialState:Config = {
    // Globals
    colorMode: ColorMode.DARK,
    showScrollbars: true,
    altTextPrompt: true,
    offsetLeft: true,
    fontSize: FontSize.Medium,
    basicKey: "",

    // Globals Defaults
    columnWidth: 21,
    refreshMs: RefreshTimingType["1m"],
    thumbnailSize: ThumbnailSize.LARGE,
    showTags: true,
    version: 1,
};

const slice = createSlice({
    name:"config",
    initialState,
    reducers:{
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

export const {setConfigValue, resetConfig} = slice.actions
export default slice.reducer