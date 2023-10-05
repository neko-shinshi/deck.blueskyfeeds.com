import { createSlice } from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {setPathOfObject} from "@/lib/utils/object";
import {UserData} from "@/lib/utils/types-constants/user-data";
import {ColumnMode} from "@/lib/utils/types-constants/column";


export interface MemoryState {
    columns: {[id:string]: {postUris:string[], lastTs:number, mode?:ColumnMode, cursor:string}} // load more resets to the top

    firehose:{cursor: string, lastTs: number} // firehose reference

    posts: {[uri:string]: Post} // Saved post info
    accounts:{[did:string]: UserData} // SAVED ACCOUNT INFO
    alert?: string
}

// don't persist this, start from scratch when first connected if main, recover from last point
// lastTs is to make sure old fetch or collision does not spoil data
const initialState:MemoryState = {posts:{}, columns:{}, firehose:{cursor:"", lastTs: 0}, accounts:{}};

const slice = createSlice({
    name:"memory",
    initialState,
    reducers:{
        showAlert: (memory, action) => {
            const {msg} = action.payload;
            memory.alert = msg;
        },
        initializeColumn: (memory, action) => {
            const {ids} = action.payload;
            if (Array.isArray(ids)) {
                ids.forEach(id => {
                    memory.columns[id] = {
                        postUris:[],
                        lastTs: 0,
                        cursor: ""
                    }
                })
            }
        },

        updateMemory: (memory, action) => {
            for (const [path, value] of Object.entries(action.payload)) {
                if (path !== "__terminate") {
                    setPathOfObject(memory, path, value);
                }
            }
        },
        resetMemory: state => {
            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value;
            }
        }
    }
});

export const {showAlert, initializeColumn, updateMemory, resetMemory} = slice.actions
export default slice.reducer