import { createSlice } from '@reduxjs/toolkit'

interface Pages {
    pages: Column[]
}

interface Column {
    id: string // type
    type: "home" | "feed" | "notifications" | "users"
    width: number
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
    type: "notifications"
    users: string[]
}

interface ColumnUsers {
    type: "users"
    user: string
    uris: string[]
}


const initialState:Pages[] = [];

const slice = createSlice({
    name:"pages",
    initialState,
    reducers:{
        addUser: (state, action) =>{
            state.push(action.payload);
        },
        removeUser: (state, action) => {
            const index = state.findIndex(x => x.did === action.payload);
            if (index >= 0) {
                state.splice(index, 1);
            }
        }
    }
});

export const {addUser, removeUser, setStatus, setOrder} = slice.actions
export default slice.reducer