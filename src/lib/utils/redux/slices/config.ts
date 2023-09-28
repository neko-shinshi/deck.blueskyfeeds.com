import { createSlice } from '@reduxjs/toolkit'

interface Config {
    colorMode: "light" | "dark" | "system"
    showScrollbars: boolean
    altTextPrompt: boolean
    offsetLeft: boolean // align to left or to avatar
    fontSize: "xs" | "sm" | "base" | "lg" | "xl"
    primaryDid: string
    basicKey: string
}

const initialState:Config = {
    colorMode: "system",
    showScrollbars: false,
    altTextPrompt: true,
    offsetLeft: true,
    fontSize: "base",
    primaryDid: "",
    basicKey: ""
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