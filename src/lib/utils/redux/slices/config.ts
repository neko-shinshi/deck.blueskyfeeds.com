import { createSlice } from '@reduxjs/toolkit'

interface Config {
    colorMode: "light" | "dark" | "system"
    maskNsfw: boolean
    hideNsfw: boolean
    showScrollbars: boolean
    altTextPrompt: boolean
    offsetLeft: boolean
    fontSize: "xs" | "sm" | "base" | "lg" | "xl"
    primaryDid: string
}

const initialState:Config = {
    colorMode: "system",
    maskNsfw: true,
    hideNsfw: false,
    showScrollbars: false,
    altTextPrompt: true,
    offsetLeft: true,
    fontSize: "base",
    primaryDid: ""
};

const slice = createSlice({
    name:"config",
    initialState,
    reducers:{
        setConfigValue: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },
    }
});

export const {setConfigValue} = slice.actions
export default slice.reducer