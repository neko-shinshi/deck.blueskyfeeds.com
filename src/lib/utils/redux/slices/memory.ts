import { createSlice } from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {setPathOfObject} from "@/lib/utils/object";
import {BlueskyUserData, UserData} from "@/lib/utils/types-constants/user-data";
import {ColumnMode} from "@/lib/utils/types-constants/column";
import {PopupConfig} from "@/lib/utils/types-constants/popup";



export interface MemoryState {
    columns: {
        [id:string]: {
            postUris: {
                current: string[],
                pending: string[]
            }
            lastTs:number,
            mode?:ColumnMode,
            cursor:string
        }
    } // load more resets to the top
    posts: {[uri:string]: Post} // Saved post info
    userData:{[id:string]: UserData} // Saved other users info
}

// Don't persist, start from scratch when first connected if main, otherwise recover from last point
// lastTs is to make sure old fetch or collision does not spoil data
const initialState:MemoryState = {posts:{}, columns:{}, userData:{}};

const slice = createSlice({
    name:"memory",
    initialState,
    reducers:{
        initializeColumn: (memory, action) => {
            const {ids} = action.payload;
            if (Array.isArray(ids)) {
                ids.forEach(id => {
                    memory.columns[id] = {
                        postUris:{
                            current:[],
                            pending:[]
                        },
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

export const {initializeColumn, updateMemory, resetMemory} = slice.actions
export default slice.reducer