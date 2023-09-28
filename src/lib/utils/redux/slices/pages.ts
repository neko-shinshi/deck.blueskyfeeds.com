import { createSlice } from '@reduxjs/toolkit'

interface Page {
    id: string // uuid
    columns: Column[]
}

interface Column {
    id: string // uuid
    type: "home" | "feed" | "notifs" | "users"
    width: number
    active: boolean
}

interface ColumnHome extends Column {
    type: "home"
    user: string
}

interface ColumnFeed extends Column {
    type: "feed"
    uri: string
    user: string
}

interface ColumnNotifications extends Column {
    type: "notifs"
    users: string[]
}

interface ColumnUsers {
    type: "users"
    user: string
    uris: string[]
}


const initialState:{val: Page[]} = {val:[]};

const slice = createSlice({
    name:"pages",
    initialState,
    reducers:{
        addColumn: (pages, action) => {
            const {pageId, columnId, type, ...data} = action.payload;
        },
        removeColumn: (pages, action) => {
            const { columnId} = action.payload;
        },
    }
});

export const {addColumn} = slice.actions
export default slice.reducer