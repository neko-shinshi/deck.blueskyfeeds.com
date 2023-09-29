import {createSlice} from '@reduxjs/toolkit'
import {FontSize} from "@/lib/utils/types-constants/font-size";
import {ColorMode} from "@/lib/utils/types-constants/color-mode";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import {ThumnailSize} from "@/lib/utils/types-constants/thumnail-size";

interface Config {
    colorMode: ColorMode
    showScrollbars: boolean
    altTextPrompt: boolean
    offsetLeft: boolean // align to left or to avatar
    fontSize: FontSize
    primaryDid: string
    basicKey: string
    width: number
    refreshMs: RefreshTimingType
    thumbnailSize: ThumnailSize
}

const initialState:Config = {
    colorMode: ColorMode.DARK,
    showScrollbars: true,
    altTextPrompt: true,
    offsetLeft: true,
    fontSize: FontSize.Medium,
    primaryDid: "",
    basicKey: "",
    width: 21,
    refreshMs: RefreshTimingType["1m"],
    thumbnailSize: ThumnailSize.LARGE
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
        resetConfig: state => {
            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value;
            }
        }
    }
});

export const {setConfigValue, resetConfig} = slice.actions
export default slice.reducer